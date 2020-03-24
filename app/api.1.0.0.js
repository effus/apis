'use strict';
const express = require('express');
const router = express.Router();
//const {getCollection, insertIntoCollection} = require('./mongo');
//const UserVo = require('./vo/UserVo');
//const ObjectID = require('mongodb').ObjectID;
//const crypto = require('crypto');
const UserService = require('./services/UserService.js');
const BotService = require('./services/BotService.js');
const ChatService = require('./services/ChatService.js');

const sendError = (res, e) => {
    res.send({result: false, message: e.message});
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
     * обновление бота
     * @param {*} req 
     * @param {*} res 
     */
    updateBot(req, res) {
        const request = req.body;
        if (!request || !request.id || !request.name || !request.gender) {
            throw Error('Some request parameters is empty');
        }
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).updateBot(
                req.params.botId,
                request.name,
                request.gender,
                request.photo
            ))
            .then((bot) => {
                res.send({result: true, bot: bot});
            })
            .catch((e) => {
                console.error('updateBot fail', e);
                sendError(res, e)
            });
    }

    setMyOwnBotPubishFlag(req, res) {
        const request = req.body;
        if (!request) {
            throw Error('Some request parameters is empty');
        }
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).setPublishFlag(
                req.params.botId,
                request.flag
            ))
            .then((bot) => {
                res.send({result: true, bot: bot});
            })
            .catch((e) => {
                console.error('setMyOwnBotPubishFlag fail', e);
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
                console.error('getMyOwnBots fail', e);
                sendError(res, e)
            });
    }

    /**
     * подробности бота с сообщениями
     * @param {*} req 
     * @param {*} res 
     */
    getMyOwnBot(req, res) {
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

    getMyBots(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).getMyBots())
            .then((bots) => {
                res.send({result: true, bots: bots});
            })
            .catch((e) => {
                console.error('getMyOwnBot fail', e);
                sendError(res, e)
            });
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    getBotStatus(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).getMyBotStatus(req.params.botId))
            .then((bot) => {
                res.send({result: true, bot: bot});
            })
            .catch((e) => {
                console.error('getMyOwnBot fail', e);
                sendError(res, e)
            });
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    getBotChat(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => {
                new BotService(userVo).getMyBotStatus(req.params.botId)
                    .then( (botVo) => new ChatService(botVo, userVo).getChat() )
                    .then((chat) => {
                        res.send({result: true, chat: chat});
                    })
            })
            .catch((e) => {
                console.error('getBotChat fail', e);
                sendError(res, e)
            });
            
    }

    /**
     * установка сообщений бота
     * @param {*} req 
     * @param {*} res 
     */
    setMyOwnBotMessages(req, res) {
        const body = req.body;
        if (!body) {
            throw Error('Some request parameters is empty');
        }
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).setMyOwnBotMessages(
                req.params.botId,
                body.messages
            ))
            .then((result) => {
                res.send({result: true, bot: result.bot, updatedCount: result.updatedCount});
            })
            .catch((e) => {
                console.error('setMyOwnBotMessages fail', e);
                sendError(res, e)
            });
    }

    getMarketBots(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).getMarketBots())
            .then((result) => {
                res.send({result: true, bots: result});
            })
            .catch((e) => {
                console.error('getMarketBots fail', e);
                sendError(res, e)
            });
    }

    buyMarketBot(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).buyMarketBot(req.params.botId))
            .then((result) => (new UserService()).buyBot(
                result.botVo,
                result.userVo
            ))
            .then((result) => (new ChatService(result.botVo, result.userVo)).createChat())
            .then((result) => {
                res.send({result: true, chat: result});
            })
            .catch((e) => {
                console.error('buyMarketBot fail', e);
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
router.post('/bot', Api.updateBot);
router.get('/bots/', Api.getMyBots);
router.get('/bot/status/:botId', Api.getBotStatus);
router.get('/bot/chat/:botId', Api.getBotChat);
router.get('/bots/own', Api.getMyOwnBots);
router.get('/bot/own/:botId', Api.getMyOwnBot);
router.post('/bot/own/:botId/messages', Api.setMyOwnBotMessages);
router.post('/bot/own/:botId/publish', Api.setMyOwnBotPubishFlag);
router.get('/bot/market', Api.getMarketBots);
router.post('/bot/market/:botId/buy', Api.buyMarketBot);

module.exports = router
