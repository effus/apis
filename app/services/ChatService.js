'use strict';

const {getCollection, insertIntoCollection, updateInCollection} = require('../mongo');
const ObjectID = require('mongodb').ObjectID;
const {ChatVo} = require('../vo/ChatVo.js');

const ChatCollectonName = 'api_chats';

class ChatService {

    constructor(botVo, userVo) {
        this.botVo = botVo;
        this.userVo = userVo;
    }

    /**
     * @param {*} params 
     */
    async find(params) {
        const collection = await getCollection(ChatCollectonName);
        return new Promise((resolve, reject) => {
            try {
                collection.findOne(params).then((documents) => {
                    resolve(documents);
                }).then(reject);
            } catch(e) {
                reject(e);
            }
        });
    }

    async getChat() {
        const result = await this.find({
            bot_id: new ObjectID(this.botVo.id),
            user_id: new ObjectID(this.userVo.id)
        });
        console.debug('getChat', result, this.botVo.id, this.userVo.id);
        if (result !== null) {
            if (Array.isArray(result) && result.length > 1) {
                throw Error('Something wrong: there are more than one chat');
            }
            return result;
        }
        return null;
    }

    /**
     * @param {*} botVo 
     * @param {*} userVo 
     */
    async createChat() {
        let chatDocument = await this.getChat(); 
        if (chatDocument) {
            console.debug('chat exist', chatDocument);
            return new ChatVo(chatDocument);
        }
        chatDocument = {
           bot_id: new Object(this.botVo.id),
           user_id: new Object(this.userVo.id),
           messages: [],
           gallery: []
        };
        const insertResult = await insertIntoCollection(ChatCollectonName, chatDocument);
        chatDocument._id = insertResult.insertedId;
        console.debug('createChat', chatDocument);
        return new ChatVo(chatDocument);
    }
}

module.exports = ChatService;