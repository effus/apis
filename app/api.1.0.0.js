'use strict';
const express = require('express');
const router = express.Router();
const Db = require('./mongo.js');

var app = express();
app.use(express.json()); 

const getCollection = (name) => {
    return new Promise((resolve, reject) => {
        Db.connect().then((client) => {
            const db = client.db('heroku_xjdq05dr');
            resolve(db.collection(name));
        }).catch(reject);
    });
}

const sendError = (res, e) => {
    res.send({error: true, message: e.message});
}

class Api100 {

    list(req, res) {
        getCollection('users')
            .then((collection) => {
                collection.find().toArray((err, items) => {
                    console.log('register', items);
                    res.send({list: items});
                });
            })
            .catch((e) => sendError(res, e));
    }

    get(req, res) {
        res.send({id:33333, hash:req.params.hash});
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    register(req, res) {   
        const user = req.body;
        //collection.insert();
        console.log('register body', reg);
        
    }
};

const Api = new Api100();

router.get('/user', Api.list);
router.get('/user/:hash', Api.get);
router.put('/user', Api.register);

/**
 * API for Date simulator
 */

/*

module.exports = Api100; */

module.exports = router
