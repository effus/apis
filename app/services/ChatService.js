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
     * @param {*} botId 
     * @param {*} userId 
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
               new ChatItemVo(null, chatCases, null, null)
           ],
           points: 0,
           botStatus: 0
        };
        const insertResult = await insertIntoCollection(ChatCollectonName, chatDocument);
        chatDocument._id = insertResult.insertedId;
        return new ChatVo(chatDocument);
    }

    /**
     * @param {*} caseId 
     */
    async setAnswer(caseId) {
        let chatDocument = await this.getChat(this.botVo.id, this.userVo.id); 
        if (!chatDocument) {
            console.error('setAnswer', 'chat not found');
            throw Error('Chat not found');
        }
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