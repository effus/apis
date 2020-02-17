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
                console.log('Mongo: connected to', this.url);
                resolve(database);
            });
        });
    }
};

module.exports.mongo = new Db();