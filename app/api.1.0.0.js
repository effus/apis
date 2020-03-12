'use strict';
const express = require('express');
const router = express.Router();
//const {getCollection, insertIntoCollection} = require('./mongo');
//const UserVo = require('./vo/UserVo');
//const ObjectID = require('mongodb').ObjectID;
//const crypto = require('crypto');
const UserService = require('./services/UserService.js'); 

const sendError = (res, e) => {
    //throw e;
    res.send({error: true, message: e.message});
}

class Api100 {

    /**
     * Авторизация по токену
     * @param {*} req 
     * @param {*} res 
     */
    getUserByAuthToken(req, res) {
        try {
            const userService = new UserService();
            let token = '';
            if (req.headers.authorization) {
                token = req.headers.authorization.replace(/token/g, '').trim();
            }
            if (!token) {
                throw Error('Bad authorization header');
            }
            userService.getUserByAuthToken(token)
                .then((result) => {
                    res.send({result: true, user: result});
                })
                .catch(e => sendError(res, e));
        } catch (e) {
            sendError(res, e)
        }
    }

    /**
     * Регистрация
     * @param {*} req 
     * @param {*} res 
     */
    registerBaseUser(req, res) {
        try {
            const request = req.body;
            if (!request || !request.email || !request.name || !request.password) {
                throw Error('Some request parameters is empty');
            }
            new UserService().registerBaseUser(request.email, request.name, request.password)
                .then((result) => {
                    res.send({result: true, user: result});
                })
                .catch(e => sendError(res, e));
        } catch (e) {
            throw e;
            sendError(res, e)
        }
    }

    /**
     * авторизация по емейлу-паролю
     * @param {*} req 
     * @param {*} res 
     */
    getUserByEmailPassword(req, res) {
        try {
            const request = req.body;
            if (!request || !request.email || !request.password) {
                throw Error('Some request parameters is empty');
            }
            new UserService().getUserByEmailPassword(request.email, request.password)
                .then((result) => {
                    res.send({result: true, user: result});
                })
                .catch(e => sendError(res, e));
        } catch (e) {
            throw e;
            sendError(res, e)
        }
    }
};

const Api = new Api100();

router.get('/', () => {
    return {result: true};
});

router.get('/user/me', Api.getUserByAuthToken);
router.put('/user/register', Api.registerBaseUser);
router.post('/user/login', Api.getUserByEmailPassword);


module.exports = router
