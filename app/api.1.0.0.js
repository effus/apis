'use strict';
const express = require('express');
const router = express.Router();
const {getCollection, insertIntoCollection} = require('./mongo');
const UserVo = require('./vo/UserVo');
const ObjectID = require('mongodb').ObjectID;
const crypto = require('crypto');

const sendError = (res, e) => {
    res.send({error: true, message: e.message});
}

const hashSomething = (str) => {
    return crypto.createHash('sha256').update(str).digest('hex');
}

class Api100 {

    list(req, res) {
        getCollection('api_users')
            .then((collection) => {
                collection.find().toArray((err, items) => {
                    res.send({result: true, list: items});
                });
            })
            .catch((e) => sendError(res, e));
    }

    get(req, res) {
        getCollection('api_users')
            .then((collection) => {
                console.log('Get user: ', req.params.id  );
                collection.find({_id: new ObjectID(req.params.id)}).toArray((err, user) => {
                    res.send({result: true, user: user});
                });
            })
            .catch((e) => sendError(res, e));
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    register(req, res) {   
        try {
            if (!req) {
                new Error('Bad request parameters')
            }
            const requestUser = req.body;
            const passwordHash = hashSomething(requestUser.password + 'samplesalt');
            const user = new UserVo(
                requestUser.email,
                passwordHash,
                requestUser.name
            );
            insertIntoCollection('api_users', user)
                .then((insertResult) => {
                    res.send({result: true, user_id: insertResult.insertedId});
                })
                .catch((e) => sendError(res, e));

        } catch(e) {
            sendError(res, e)
        }
    }
};

const Api = new Api100();

router.get('/user', Api.list);
router.get('/user/:id', Api.get);
router.put('/user', Api.register);

/**
 * API for Date simulator
 */

/*

module.exports = Api100; */

module.exports = router
