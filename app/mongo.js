const MongoClient = require('mongodb').MongoClient;
const MongoConfig = require('./../mongo.json')['production'];
const mongoParams = {
    useUnifiedTopology: true,
    connectTimeoutMS: 5000
};

class Db {
    constructor() {
        this.url = process.env[MongoConfig.use_env_variable];
    }
    connect() {
        return new Promise((resolve, reject) => {
            MongoClient.connect(this.url, mongoParams, (err, database) => {
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

/**
 * @param {*} collection 
 * @param {*} valueObject 
 */
const insertIntoCollection = async (collection, valueObject) => {
    return await new Promise((resolve, reject) => {
        Mongo.connect().then((client) => {
            const db = client.db(MongoConfig.db_name);
            db.collection(collection).insertOne(valueObject, (err, res) => {
                if (err) {
                    console.error('insertIntoCollection', err);
                    reject(err);
                }
                resolve(res);
            });
        }).catch(reject);
    });
}

/**
 * @param {*} collection 
 * @param {*} document 
 * @param {*} searchParams 
 */
const updateInCollection = async (collection, document, searchParams) => {
    const client = await Mongo.connect();
    const db = client.db(MongoConfig.db_name);
    const result = await db.collection(collection).updateOne(
        searchParams, 
        {$set: document}
    );
    console.debug('result', searchParams);
    return result;
}

const saveDocumentInCollection = async (collection, document) => {
    return await new Promise((resolve, reject) => {
        Mongo.connect().then((client) => {
            const db = client.db(MongoConfig.db_name);
            console.debug('saveDocumentInCollection', document);
            db.collection(collection).save(document, (err, res) => {
                if (err) {
                    console.error('saveDocumentInCollection', err);
                    reject(err);
                }
                console.debug('saveDocumentInCollection OK', document);
                resolve(res);
            });
        }).catch(reject);
    });
}

const truncateCollection = async (collection) => {
    const connect = await Mongo.connect();
    const db = connect.db(MongoConfig.db_name);
    return await db.collection(collection).deleteMany({});
};

const deleteInCollection = async (collection, searchParams) => {
    const connect = await Mongo.connect();
    const db = connect.db(MongoConfig.db_name);
    return await db.collection(collection).deleteMany(searchParams);
};

/**
 * @param {*} collectionName 
 * @param {*} params 
 */
const findMany = async (collectionName, params) => {
    const collection = await getCollection(collectionName);
    return collection.find(params).toArray();
}

/**
 * @param {*} collectionName 
 * @param {*} params 
 */
const getDocument = async (collectionName, params) => {
    const documents = await findMany(collectionName, params);
    if (documents.length === 0) {
        throw Error('Document not found');
    }
    return documents[0];
}

module.exports = {
    Mongo, 
    getCollection, 
    insertIntoCollection, 
    updateInCollection, 
    deleteInCollection,
    saveDocumentInCollection,
    truncateCollection,
    findMany,
    getDocument
};
