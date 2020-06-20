'use strict';

const {getCollection, insertIntoCollection, updateInCollection} = require('../mongo');
const ObjectID = require('mongodb').ObjectID;

class BAPService {

    
    /**
     * @param {*} sort 
     * @param {*} group 
     */
    async randomDocument(collectionName) {
        const collection = await getCollection(collectionName);
        const count = await collection.countDocuments({});
        console.debug('count ', count);
        const r = Math.floor(Math.random() * count);
        const cursor = collection.find({}).limit(1).skip(r);
        return await cursor.toArray();
    }

    /**
     * @param {*} name 
     */
    async insertFirstname(name) {
        if (!name) {
            throw Error('name is empty');
        }
        await insertIntoCollection('bap_firstnames', {name:name});
    }

    /**
     * @param {*} name 
     */
    async insertLastname(name) {
        if (!name) {
            throw Error('name is empty');
        }
        await insertIntoCollection('bap_lastnames', {name:name});
    }

    async getRandomName() {
        const doc = await this.randomDocument('bap_firstnames');
        console.debug('d', doc);
        return doc[0].name;
    }

    async getRandomLastname() {
        const doc = await this.randomDocument('bap_lastnames');
        return doc[0].name;
    }

    getRandomLogin() {
        const num = Math.round(Math.random() * 99999999);
        return 'bap' + num;
    }

    async newBot() {
        const bot = {
            name: await this.getRandomName(),
            lastname: await this.getRandomLastname(),
            login: this.getRandomLogin(),
            password: 'eff060606',
            controlQuestion: 'who is next',
            controlAnswer: 'not me'
        };
        const insertResult = await insertIntoCollection('bap_legion', bot);
        bot.id = insertResult.insertedId;
        return bot;
    }

    async confirmRegistration(id, flag) {
        const updateResult = await updateInCollection(
            'bap_legion',
            {registered: flag},
            {_id: new ObjectID(id)}
        );
    }

}

module.exports = {BAPService};
