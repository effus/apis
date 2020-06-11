'use strict';
const express = require('express');
const router = express.Router();
const {UserService} = require('./services/UserService.js');

const sendError = (res, e) => {
    res.send({result: false, message: e.message});
}

class Api200 {
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
                console.debug('request', request);
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
}

const Api = new Api200();
router.get('/', Api.ping);
router.get('/user/me', Api.getUserByAuthToken);
router.put('/user/register', Api.registerBaseUser);
router.post('/user/login', Api.getUserByEmailPassword);

module.exports = router;
