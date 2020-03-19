'use strict';
const express = require('express');
const router = express.Router();
//const {getCollection, insertIntoCollection} = require('./mongo');
//const UserVo = require('./vo/UserVo');
//const ObjectID = require('mongodb').ObjectID;
//const crypto = require('crypto');
const UserService = require('./services/UserService.js');
const BotService = require('./services/BotService.js');

const sendError = (res, e) => {
    //throw e;
    res.send({error: true, message: e.message});
}

class Api100 {

    ping(req, res) {
	    res.send({result:true});
    }

    /**
     * Авторизация по токену
     * @param {*} req
     * @param {*} res
     */
    async getUserByAuthToken(req, res) {
        try {
            const userVo = await new UserService().getUserVoByRequest(req);
            res.send({result: true, user: userVo});
        } catch (e) {
            console.error('getUserByAuthToken fail', e);
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
            console.error('registerBaseUser fail', e);
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
            console.error('getUserByEmailPassword fail', e);
            sendError(res, e)
        }
    }

    /**
     * создание бота
     * @param {*} req 
     * @param {*} res 
     */
    createBot(req, res) {
        const request = req.body;
        if (!request || !request.name || !request.gender) {
            throw Error('Some request parameters is empty');
        }
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).registerBot(
                request.name,
                request.gender,
                request.photo
            ))
            .then((bot) => {
                res.send({result: true, bot: bot});
            })
            .catch((e) => {
                console.error('createBot fail', e);
                sendError(res, e)
            });
    }

    /**
     * созданные мной боты
     * @param {*} req 
     * @param {*} res 
     */
    getMyOwnBots(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).getMyOwnBots())
            .then((bots) => {
                res.send({result: true, bots: bots});
            })
            .catch((e) => {
                console.error('getMyOwnBot fail', e);
                sendError(res, e)
            });
    }

    /**
     * подробности бота с сообщениями
     * @param {*} req 
     * @param {*} res 
     */
    getMyOwnBot(req, res) {
        //res.send({result: true, bots: req.params.botId});
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).getMyOwnBot(req.params.botId))
            .then((bot) => {
                res.send({result: true, bot: bot});
            })
            .catch((e) => {
                console.error('getMyOwnBot fail', e);
                sendError(res, e)
            });
    }
};

const Api = new Api100();

router.get('/', Api.ping);
router.get('/user/me', Api.getUserByAuthToken);
router.put('/user/register', Api.registerBaseUser);
router.post('/user/login', Api.getUserByEmailPassword);
router.put('/bot', Api.createBot);
router.get('/bots/own', Api.getMyOwnBots);
router.get('/bot/own/:botId', Api.getMyOwnBot);

module.exports = router
