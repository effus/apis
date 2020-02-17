'use strict';
const express = require('express');
const router = express.Router();
const {getCollection} = require('./mongo');
const UserVo = require('./vo/UserVo');

const sendError = (res, e) => {
    res.send({error: true, message: e.message});
}

class Api100 {

    list(req, res) {
        getCollection('meetapi')
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
        //const user = req;
        //collection.insert();
        console.log('register body', req.body);
        res.send({result:true});
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
