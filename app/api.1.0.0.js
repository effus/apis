'use strict';
const express = require('express');
const router = express.Router();
//const {getCollection, insertIntoCollection} = require('./mongo');
//const UserVo = require('./vo/UserVo');
//const ObjectID = require('mongodb').ObjectID;
//const crypto = require('crypto');
const {UserService} = require('./services/UserService.js');
const {BotService} = require('./services/BotService.js');
const {ChatService} = require('./services/ChatService.js');
const {SecureService} = require('./services/SecureService.js');

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
        //@todo: обновлять можно только есть нет созданных чатов
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

    /**
     * удаление бота
     */
    deleteOwnBot(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new BotService(userVo)).deleteOwnBot(req.params.botId))
            .then(() => {
                res.send({result: true});
            })
            .catch((e) => {
                console.error('deleteOwnBot fail', e);
                sendError(res, e)
            });
    }

    /**
     * публикация и снятие
     * @param {*} req 
     * @param {*} res 
     */
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

    /**
     * список полученных ботов
     * @param {*} req 
     * @param {*} res 
     */
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
            .then((userVo) => {
                const botVo = await (new BotService(userVo)).getMyBot(req.params.botId);
                const chatVo = await (new ChatService(botVo, userVo)).getChat();
                botVo.setStatus(chatVo.status);
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
                new BotService(userVo).getMyBot(req.params.botId)
                    .then( (botVo) => new ChatService(botVo, userVo).getChat() )
                    .then((chatVo) => {
                        res.send({result: true, chat: chatVo});
                    })
            })
            .catch((e) => {
                console.error('getBotChat fail', e);
                sendError(res, e)
            });
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    setUserChatAnswer(req, res) {
        const body = req.body;
        if (!body) {
            throw Error('Some request parameters is empty');
        }
        new UserService().getUserVoByRequest(req)
            .then((userVo) => {
                new BotService(userVo).getMyBotMessages(req.params.botId)
                    .then( (botVo) => new ChatService(botVo, userVo).setAnswer(body.caseId) )
                    .then((chat) => {
                        res.send({result: true, chat, currentCases: []});
                    })
                    .catch((e) => {
                        console.error('set chat answer fail', e);
                        sendError(res, e)
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
        //@todo: обновлять можно только есть нет созданных чатов
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

    /**
     * список опубликованных ботов
     * @param {*} req 
     * @param {*} res 
     */
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

    /**
     * получение бота
     * @param {*} req 
     * @param {*} res 
     */
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

    /**
     * специальные экшены для тестов
     * @param {*} req 
     * @param {*} res 
     */
    secureActions(req, res) {
        const service = new SecureService();
        const action = req.params.action;
        let token = null;
        if (req.headers.authorization) {
            console.debug('auth', req.headers.authorization);
            token = req.headers.authorization.replace(/token/g, '').trim();
        }
        const allowdeMethods = ['resetDb', 'resetChats', 'resetDialogs', 'resetBots'];
        if (!allowdeMethods.includes(action)) {
            return res.send({result: false, message: 'action not allowed'});
        }

        console.debug('secureActions call', action, token);

        service[action](token)
            .then((result) => {
                res.send({result: result});
            })
            .catch((e) => {
                console.error('secureActions fail', e);
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
router.delete('/bot/:botId', Api.deleteOwnBot);
router.get('/bots/', Api.getMyBots);
router.get('/bot/status/:botId', Api.getBotStatus);
router.get('/bot/chat/:botId', Api.getBotChat);
router.post('/bot/chat/:botId', Api.setUserChatAnswer);
router.get('/bots/own', Api.getMyOwnBots);
router.get('/bot/own/:botId', Api.getMyOwnBot);
router.post('/bot/own/:botId/messages', Api.setMyOwnBotMessages);
router.post('/bot/own/:botId/publish', Api.setMyOwnBotPubishFlag);
router.get('/bot/market', Api.getMarketBots);
router.post('/bot/market/:botId/buy', Api.buyMarketBot);
router.delete('/secure/:action', Api.secureActions);

module.exports = router
