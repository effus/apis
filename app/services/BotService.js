'use strict';
const {getCollection, insertIntoCollection, updateInCollection} = require('../mongo');
const ObjectID = require('mongodb').ObjectID;
const {BotVo} = require('../vo/BotVo.js');

class BotService {

    /**
     * @param UserVo userVo 
     */
    constructor(userVo) {
        this.userVo = userVo;
    }

    /**
     * поиск ботов в коллекции
     * @param {*} params 
     */
    async findMany(params) {
        const collection = await getCollection('api_bots');
        return new Promise((resolve, reject) => {
            try {
                collection.find(params).toArray().then((documents) => {
                    resolve(documents);
                }).then(reject);
            } catch(e) {
                reject(e);
            }
        });
    }

    /**
     * Создание бота
     * @param {string} name 
     * @param {string} gender 
     * @param {string} photoUrl 
     */
    async registerBot(name, gender, photoUrl) {
        let object = {
            author: this.userVo.id,
            flag_publish: false,
            name: name,
            gender: gender,
            photoUrl: photoUrl,
            messages: []
        };
        const insertResult = await insertIntoCollection('api_bots', object);
        object._id = insertResult.insertedId;
        return new BotVo(object);
    }

    /**
     * Получение собственных ботов
     */
    async getMyOwnBots() {
        const result = await this.findMany({
            author: new ObjectID(this.userVo.id)
        });
        let bots = [];
        for (let i in result) {
            bots.push(new BotVo(result[i]));
        }
        return bots;
    }
    
    /**
     * Получение бота
     */
    async getMyOwnBot(botId) {
        const result = await this.findMany({
            //author: new ObjectID(this.userVo.id),
            _id: new ObjectID(botId)
        });
        if (!result) {
            throw Error('Bot not found');
        }
        let bot = new BotVo(result)
        bot.setMessages(result.messages);
        return bot;
    }
}

module.exports = BotService;