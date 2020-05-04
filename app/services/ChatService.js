'use strict';

const {getCollection, insertIntoCollection, updateInCollection} = require('../mongo');
const ObjectID = require('mongodb').ObjectID;
const {ChatVo} = require('../vo/ChatVo.js');
const {ChatItemVo} = require('../vo/ChatItemVo.js');

const ChatCollectonName = 'api_chats';


/**
 * Статусы бота (на самом деле - чата)
 */
const ChatStatuses = {
    Error: -2,
    ChatFinished: -1,
    WaitUserReply: 1, // expecting user answer
    WaitBotReply: 2 // last message reply.sendAt > current time 
};

class ChatService {

    /**
     * @param {BotVo} botVo 
     * @param {UserVo} userVo 
     */
    constructor(botVo, userVo) {
        this.botVo = botVo;
        this.userVo = userVo;
    }

    /**
     * @param {*} params 
     */
    async findChat(params) {
        const collection = await getCollection(ChatCollectonName);
        return await collection.findOne(params);
    }

    /**
     * @return {ChatVo}
     */
    async getChat() {
        if (!this.botVo || !this.userVo) {
            throw Error('Bot or User undefined');
        }
        const result = await this.findChat({
            bot_id: new ObjectID(this.botVo.id),
            user_id: new ObjectID(this.userVo.id)
        });
        if (result !== null) {
            if (Array.isArray(result) && result.length > 1) {
                throw Error('Something wrong: there are more than one chat');
            }
            return new ChatVo(result);
        }
        return null;
    }

    /**
     * return {ChatVo}
     */
    async createChat() {
        let chatDocument = await this.getChat(this.botVo.id, this.userVo.id); 
        if (chatDocument) {
            console.error('chat exist', chatDocument);
            return new ChatVo(chatDocument);
        }
        
        const firstMessage = this.botVo.messages[0];
        chatDocument = {
           bot_id: new Object(this.botVo.id),
           user_id: new Object(this.userVo.id),
           messages: [
               new ChatItemVo(null, firstMessage.id, 0)
           ],
           points: 0,
           status: ChatStatuses.WaitUserReply
        };
        const insertResult = await insertIntoCollection(ChatCollectonName, chatDocument);
        chatDocument._id = insertResult.insertedId;
        return new ChatVo(chatDocument);
    }

    /**
     * @param {*} messageId 
     * @return {{ index: Number, message: {*} }}
     */
    getBotMessageById(messageId) {
        for (let i in this.botVo.messages) {
            if (this.botVo.messages[i].id === messageId) {
                return {
                    index: i, 
                    message: this.botVo.messages[i]
                };
            }
        }
        console.error('getBotMessageById', 'bot message not found', messageId);
        throw Error('Message not found');
    }

    /**
     * 
     * @param {*} messageId 
     * @param {*} caseId 
     */
    getMessageCase(messageId, caseId) {
        const {message} = this.getBotMessageById(messageId);
        for (let i in message.cases) {
            if (message.cases[i].id === caseId) {
                return message.cases[i];
            }
        }
        console.error('getMessageCase', 'bot message cases not found', messageId, caseId);
        throw Error('Message case not found');
    }

    
    /**
     * @param {*} botMessage 
     * @param {*} chatPoints 
     */
    getFirstAvailableAnswer(botMessage, chatPoints)
    {
        if (!botMessage.next) {
            console.error('getFirstAvailableAnswer', 'bot message next is empty');
            return null;
        }
        function compare(a, b) {
            if (a.points > b.points) return -1;
            if (b.points > a.points) return 1;
            return 0;
        }
        const sorted = botMessage.next.slice().sort(compare);
        for (let i in sorted) {
            if (sorted[i].points <= chatPoints) {
                return sorted[i];
            }
        }
        return null;
    }

    /**
     * 1 message: reply is empty, user choose case, create next message
     * 2 message: reply is answer for user's prev. message case
     * ...
     * 10 message: next goto is :finish:, no new messages, status is off
     * 
     * @param {*} caseId 
     */
    async setAnswer(caseId) {
        let chatVo = await this.getChat(this.botVo.id, this.userVo.id); 
        if (!chatVo) {
            console.error('setAnswer', 'chat not found');
            throw Error('Chat not found');
        }
        const chatLastMessage = chatVo.messages[chatVo.messages.length - 1];
        const {message} = this.getBotMessageById(chatLastMessage.messageId);
        if (!chatLastMessage.selected) {
            const messageCase = this.getMessageCase(
                chatLastMessage.messageId,
                caseId
            );
            chatVo.points += messageCase.points;
            chatVo.messages[chatVo.messages.length-1].selected = caseId;
            chatVo.messages[chatVo.messages.length-1].sendAt = new Date();
            chatVo.messages[chatVo.messages.length-1].points = messageCase.points;
        }
        
        const answer = this.getFirstAvailableAnswer(message, chatVo.points);
        if (!answer) { // answer not found for that points count
            chatVo.status = ChatStatuses.ChatFinished;
            await updateInCollection(ChatCollectonName, {
                messages: chatVo.messages,
                status: chatVo.status
            }, {_id: new ObjectID(chatVo.id)});
            return chatVo;
        }
        if (answer.goto === ':finish:') {
            chatVo.status = ChatStatuses.ChatFinished;
            await updateInCollection(ChatCollectonName, {
                status: chatVo.status,
                messages: chatVo.messages
            }, {_id: new ObjectID(chatVo.id)});
            return chatVo;
        }
    
        const {message: nextMessage} = this.getBotMessageById(parseInt(answer.goto));
        if (!nextMessage) {
            console.error('nextMessage is empty', answer.goto);
            throw Error('Unable to find next message');
        }

        chatVo.messages.push(
            new ChatItemVo(
                {
                    text: nextMessage.text,
                    showAt: new Date()
                }, 
                nextMessage.id,
                chatVo.points
            )
        );
        
        await updateInCollection(ChatCollectonName, {
            messages: chatVo.messages,
            status: ChatStatuses.Online
        }, {_id: new ObjectID(chatVo.id)});

        chatVo.status = ChatStatuses.WaitUserReply; // @todo waitBotReply
        await updateInCollection(ChatCollectonName, {
            status: chatVo.status,
            messages: chatVo.messages
        }, {_id: new ObjectID(chatVo.id)});
        return chatVo;

        //@todo
        //1. найти последнее сообщение
        //2. проверить: что не отвечено, что существует вариант ответа
        //3. установить ответ
        //4. установить баллы
        //5. определить и установить следующее сообщение
        //6. определить установить статус чата

        
    }
}

module.exports = {ChatService, ChatCollectonName, ChatStatuses};