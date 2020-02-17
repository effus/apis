const MongoClient    = require('mongodb').MongoClient;
const MongoConfig = require('./../mongo.json')['production'];

class Db {
    constructor() {
        this.url = process.env[MongoConfig.use_env_variable];
    }
    connect() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, (err, database) => {
                if (err) {
                    reject();
                }
                console.log('Mongo connected to', this.url);
                resolve(database);
            });
        });
    }
};

const Mongo = new Db();

const getCollection = (name) => {
    return new Promise((resolve, reject) => {
        Mongo.connect().then((client) => {
            const db = client.db(MongoConfig.db_name);
            resolve(db.collection(name));
        }).catch(reject);
    });
}

const insertIntoCollection(collection, valueObject) => {
    return new Promise((resolve, reject) => {
        Mongo.connect().then((client) => {
            const db = client.db(MongoConfig.db_name);
            db.collection(collection).insertOne(valueObject, (err, res) => {
                if (err) {
                    reject();
                }
                resolve(res);
            });
        }).catch(reject);
    });
}

module.exports = {Mongo, getCollection, insertIntoCollection};