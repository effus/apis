'use strict';
const express = require('express');
const router = express.Router();
const Db = require('./mongo.js');

const getCollection = (name) => {
    return new Promise((resolve, reject) => {
        this.Db.connect().then((client) => {
            const db = client.db('heroku_xjdq05dr');
            resolve(db.collection(name));
        }).catch(reject);
    });
}

class Api100 {

    register(req, res) {
        
        getCollection('users').find().toArray((err, items) => {
            console.log('register', items);
            res.send({wtf:true, items: items});
        });
    
    }

};

const Api = new Api100();

router.get('/user/register', Api.register);

/**
 * API for Date simulator
 */

/*

module.exports = Api100; */

module.exports = router
