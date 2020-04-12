'use strict';

const {getCollection, insertIntoCollection, updateInCollection} = require('../mongo');
const ObjectID = require('mongodb').ObjectID;
const {ChatVo} = require('../vo/ChatVo.js');
const {ChatItemVo} = require('../vo/ChatItemVo.js');

const ChatCollectonName = 'api_chats';

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
        console.debug('getChat', result);
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
        if (firstMessage.cases.length === 0) {
            throw Error('No cases to start a chat');
        }
        let chatCases = [];
        for (let i in firstMessage.cases) {
            chatCases.push({
                id: firstMessage.cases[i].id,
                text: firstMessage.cases[i].text
            });
        }
        chatDocument = {
           bot_id: new Object(this.botVo.id),
           user_id: new Object(this.userVo.id),
           messages: [
               new ChatItemVo(null, firstMessage.id, chatCases, null, null)
           ],
           points: 0,
           status: 0
        };
        const insertResult = await insertIntoCollection(ChatCollectonName, chatDocument);
        chatDocument._id = insertResult.insertedId;
        return new ChatVo(chatDocument);
    }

    /**
     * @param {*} caseId 
     */
    async setAnswer(caseId) {
        console.debug('setAnswer set case', caseId);
        console.debug('setAnswer bot.messages', this.botVo.messages);
        let chatVo = await this.getChat(this.botVo.id, this.userVo.id); 
        if (!chatVo) {
            console.error('setAnswer', 'chat not found');
            throw Error('Chat not found');
        }
        const chatLastMessage = chatVo.messages[chatVo.messages.length - 1];
        if (!chatLastMessage.selected) {
            const botMessageId = chatLastMessage.messageId;
            let botMessage = null;
            for (let i in this.botVo.messages) {
                if (this.botVo.messages[i].id === botMessageId) {
                    botMessage = this.botVo.messages[i];
                    break;
                }
            }
            if (botMessage === null) {
                console.error('setAnswer', 'bot message not found');
                throw Error('Message not found');
            }
            if (!botMessage.cases) {
                console.error('setAnswer', 'bot message cases is empty');
                throw Error('Message cases is empty');
            }
            let messageCase = null;
            for (let i in botMessage.cases) {
                if (botMessage.cases[i].id === caseId) {
                    messageCase = botMessage.cases[i];
                }
            }
            if (messageCase === null) {
                console.error('setAnswer', 'bot message cases not found');
                throw Error('Message case not found');
            }
            chatVo.points += messageCase.points;
            //chatLastMessage.selected = caseId;
            //this.botVo.messages[i] = chatLastMessage;
            //@todo set selected + set points
        }
        if (!botMessage.next) {
            console.error('setAnswer', 'bot message next is empty');
            throw Error('Message next is empty');
        }
        let next = null;
        let maxPoints = 0;
        for (let i in botMessage.next) {
            if (botMessage.next[i].points >= maxPoints && botMessage.next[i].points <= chatVo.points) {
                next = botMessage.next[i];
                maxPoints = botMessage.next[i].points;
            }
        }
        console.debug('next', chatVo.points, next);

        //@todo
        //1. найти последнее сообщение
        //2. проверить: что не отвечено, что существует вариант ответа
        //3. установить ответ
        //4. установить баллы
        //5. определить и установить следующее сообщение
        //6. определить установить статус чата

        
    }
}

module.exports = {ChatService, ChatCollectonName};