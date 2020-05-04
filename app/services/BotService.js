'use strict';
const {getCollection, insertIntoCollection, updateInCollection} = require('../mongo');
const ObjectID = require('mongodb').ObjectID;
const {BotVo} = require('../vo/BotVo.js');

const ReservedTargetWords = {
    FINISH: ':finish:'
};

const BotsCollectonName = 'api_bots';

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
        const collection = await getCollection(BotsCollectonName);
        return collection.find(params).toArray();
    }

    /**
     * @param {*} botId 
     */
    async getMyOwnBotDocument(botId) {
        const result = await this.findMany({
            author: new ObjectID(this.userVo.id),
            _id: new ObjectID(botId)
        });
        if (!result) {
            throw Error('Bot not found');
        }
        return result[0];
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
            version: 0,
            name: name,
            gender: gender,
            photo_url: photoUrl,
            messages: []
        };
        const insertResult = await insertIntoCollection(BotsCollectonName, object);
        object._id = insertResult.insertedId;
        return new BotVo(object);
    }

    /**
     * обновление публичных свойств бота
     * @param {*} botId 
     * @param {*} name 
     * @param {*} gender 
     * @param {*} photoUrl 
     */
    async updateBot(botId, name, gender, photoUrl) {
        let bot = await this.getMyOwnBotDocument(botId);
        bot.name = name;
        bot.gender = gender;
        bot.photo_url = photoUrl;
        const updateResult = await updateInCollection(
            BotsCollectonName,
            bot,
            {_id: new ObjectID(botId)}
        );
        return {
            updatedCount: updateResult.modifiedCount,
            bot: new BotVo(bot)
        };
    }

    
    /**
     * Выставление статуса публикации бота
     * @param {*} botId 
     * @param {*} flag 
     */
    async setPublishFlag(botId, flag) {
        let bot = await this.getMyOwnBotDocument(botId);
        console.debug('setPublishFlag', bot);
        let updated = null;
        if (flag === false) {
            let object = {
                author: this.userVo.id,
                flag_publish: false,
                version: (bot.version ? bot.version : 0) + 1,
                origin_id: new ObjectID(botId),
                name: bot.name,
                gender: bot.gender,
                photo_url: bot.photo_url,
                messages: bot.messages
            };
            updated = await updateInCollection(
                BotsCollectonName,
                { 
                    flag_publish: false,
                    author: null
                },
                {_id: new ObjectID(botId)}
            );
            
            await insertIntoCollection(BotsCollectonName, object);
        } else {
            updated = await updateInCollection(
                BotsCollectonName,
                {flag_publish: true},
                {_id: new ObjectID(botId)}
            );    
        }
        return {
            updatedCount: updated.modifiedCount
        };
    }

    /**
     * удаление бота
     * @param {*} botId 
     */
    async deleteOwnBot(botId) {
        let bot = await this.getMyOwnBotDocument(botId);
        bot.author = null;
        bot.flag_publish = false;
        await updateInCollection(
            BotsCollectonName,
            bot,
            {_id: new ObjectID(botId)}
        );
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
            let bot = new BotVo(result[i]);
            bot.setStatistic(
                result[i].messages ? result[i].messages.length : 0, 
                2, 3, 4); // @todo
            bots.push(bot);
        }
        return bots;
    }

    /**
     * Получение купленных ботов
     */
    async getMyBots() {
        const botIds = Object.keys(this.userVo.bots).map(value => new ObjectID(value));
        const result = await this.findMany({
            _id: {$in: botIds}
        });
        if (!result) {
            return [];
        }
        let bots = [];
        for (let i in result) {
            let botVo = new BotVo(result[i]);
            //@todo check status
            //botVo.setStatus(BotStatuses.Online);
            bots.push(botVo);
        }
        return bots;
    }
    
    /**
     * Получение бота
     */
    async getMyOwnBot(botId) {
        const result = await this.getMyOwnBotDocument(botId);
        let bot = new BotVo(result);
        bot.setMessages(result.messages);
        return bot;
    }

    /**
     * @param {*} botId 
     */
    async getMyBotDocument(botId) {
        const botIds = Object.keys(this.userVo.bots);
        if (!botIds.includes(botId)) {
            throw Error('Information not available');
        }
        const documents = await this.findMany({
            _id: new ObjectID(botId)
        });
        if (!documents) {
            throw Error('Bot not found');
        }
        return documents[0];
    }

    /**
     * @param {*} botId 
     */
    async getMyBotVo(botId) {
        const document = await this.getMyBotDocument(botId);
        return new BotVo(document);
    }

    /**
     * @param {*} botId 
     */
    async getMyBotMessages(botId) {
        const document = await this.getMyBotDocument(botId);
        let botVo = new BotVo(document);
        botVo.setMessages(document.messages);
        return botVo;
    }

    /**
     * @param {Number} botId 
     * @param {Number} messageId 
     */
    async getBotMessageById(botId, messageId) {
        const botVo = await this.getMyBotMessages(botId);
        if (!botVo.messages) {
            throw Error('No messages for bot');
        }
        for (let i in botVo.messages) {
            if (botVo.messages[i].id === messageId) {
                return botVo.messages[i];
            }
        }
        throw Error('Message not found');
    }

    /**
     * check dublicates, empties, max and min points of message.cases
     * @param {Array} cases 
     */
    checkMessageCases(cases) {
        let ids = [];
        if (!Array.isArray(cases)) {
            throw Error('message.cases is not an array');
        }
        for (let i in cases) {
            if (!cases[i].id) {
                throw Error('Undefined message.cases.id');
            }
            if (ids.includes(cases[i].id)) {
                throw Error('Dublicate id in message.case');
            }
            ids.push(cases[i].id);
            if (typeof cases[i].text !== 'string') {
                throw Error('Bad type of message.cases.text');
            }
            if (cases[i].text === '') {
                throw Error('message.cases.text is empty');
            }
            if (typeof cases[i].points !== 'number') {
                throw Error('Bad type of points message.cases.points');
            }
            if (cases[i].points < -10) {
                throw Error('message.cases.points is less than minimal allowed value ');
            }
            if (cases[i].points > 10) {
                throw Error('message.cases.points is greater than maximal allowed value ');
            }
        }
        return true;
    }

    /**
     * @param {Array} next 
     */
    checkMessageNext(next) {
        if (!Array.isArray(next)) {
            throw Error('message.next is not an array');
        }
        for (let i in next) {
            if (typeof next[i].id !== 'number') {
                throw Error('Bad type message.next.id //' + typeof next[i].id);
            }

            if (typeof next[i].points !== 'number') {
                throw Error('Bad type message.next.points');
            }
            if (typeof next[i].goto !== 'string') {
                throw Error('Bad type message.next.goto');
            }
            if (next[i].points < 0) {
                throw Error('Bad message.next.goto value');
            }
        }
        return true;
    }

    /**
     * @param {{
     *  id: String,
     *  text: String,
     *  cases: Array,
     *  next: Array
     * }} message
     * @return boolean
     */
    checkMessageStructure(message) {
        if (!message.id) {
            throw Error('Indefined id in bot message');
        }
        if (!message.text) {
            throw Error('Indefined text in bot message');
        }
        this.checkMessageCases(message.cases);
        this.checkMessageNext(message.next);
        return true;
    }

    /**
     * @param {Array} messages 
     * @param {Array} messageIds 
     */
    checkNextTargets(messages, messageIds) {
        for (let i in messages) {
            for (let j in messages[i].next) {
                const targetId = messages[i].next[j].goto;
                const reservedWords = [ReservedTargetWords.FINISH];
                if (reservedWords.includes(targetId)) {
                    continue;
                }
                if (!messageIds.includes(parseInt(messages[i].next[j].goto))) {
                    throw Error('message.next.id has wrong target');
                }
            }
        }
        return true;
    }

    /**
     * Запись конфига сообщений
     * @param {*} botId 
     * @param {Array} messages 
     */
    async setMyOwnBotMessages(botId, messages) {
        const bot = await this.getMyOwnBot(botId);
        if (messages.length === 0) {
            return {
                updatedCount: 0,
                bot: bot
            }
        }
        
        let messageIds = [];
        for (let i in messages) {
            this.checkMessageStructure(messages[i]);
            messageIds.push(messages[i].id);
        }
        this.checkNextTargets(messages, messageIds);

        const updated = await updateInCollection(
            BotsCollectonName,
            {messages: messages},
            {_id: new ObjectID(botId)}
        );
        
        bot.setMessages(messages);   
        return {
            updatedCount: updated.modifiedCount,
            bot: bot,
            stat: {
                chatItems: messageIds.length
            }
        };
    }

    /**
     * список публичных ботов
     */
    async getMarketBots() {
        let documents = await this.findMany({
            flag_publish: true
        });
        if (!documents) {
            return [];
        }
        let bots = [];
        for (let i in documents) {
            let bot = new BotVo(documents[i]);
            bot.setStatistic(
                documents[i].messages.length, 
                2, 3, 4 //@todo
            ); 
            if (typeof this.userVo.bots[bot.id] !== 'undefined') {
                bot.setMarketProperties(true);
            } else {
                console.debug('includes', this.userVo.bots, bot.id);
                bot.setMarketProperties(false);
            }
            bots.push(bot);
        }
        return bots;
    }

    /**
     * покупка бота
     * @param {*} botId 
     */
    async buyMarketBot(botId) {
        const documentsBot = await this.findMany({
            _id: new ObjectID(botId)
        });
        if (!documentsBot) {
            throw Error('Bot not found');
        }
        // @todo do something with stat or else
        let botVo = new BotVo(documentsBot[0]); 
        botVo.setMessages(documentsBot[0].messages);
        return {
            botVo: botVo,
            userVo: this.userVo 
        };
    }
}

module.exports = {BotService, BotsCollectonName};