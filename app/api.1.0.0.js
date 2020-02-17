'use strict';
const express = require('express');
const router = express.Router();
const {getCollection, insertIntoCollection} = require('./mongo');
const UserVo = require('./vo/UserVo');

const sendError = (res, e) => {
    res.send({error: true, message: e.message});
}

class Api100 {

    list(req, res) {
        getCollection('api_users')
            .then((collection) => {
                collection.find().toArray((err, items) => {
                    console.log('list', items);
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
        try {
            if (!req) {
                new Error('Bad request parameters')
            }
            const requestUser = req.body;
            const passwordHash = '123';
            const user = new UserVo(
                requestUser.email,
                passwordHash,
                requestUser.name
            );
            insertIntoCollection('api_users', user)
                .then((insertResult) => {
                    res.send({result: true, inserted: insertResult});
                })
                .catch((e) => sendError(res, e));

        } catch(e) {
            sendError(res, e)
        }
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
