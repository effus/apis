'use strict';
const express = require('express');
const router = express.Router();
const {UserService} = require('./services/UserService.js');
const {VirtualBillsService} = require('./services/VirtualBillsService.js');

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

    /**
     * список счетов
     * @param {*} req 
     * @param {*} res 
     */
    getBills(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new VirtualBillsService(userVo)).getBills())
            .then((bills) => {
                res.send({result: true, bills: bills});
            })
            .catch((e) => {
                console.error('getBills fail', e);
                sendError(res, e)
            });
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    createBill(req, res) {
        const request = req.body;
        if (!request || !request.name) {
            throw Error('Some request parameters is empty');
        }
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new VirtualBillsService(userVo)).createBill(request.name))
            .then((bill) => {
                res.send({result: true, bill: bill});
            })
            .catch((e) => {
                console.error('createBill fail', e);
                sendError(res, e)
            });
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    deleteBill(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new VirtualBillsService(userVo)).deleteBill(req.params.id))
            .then(() => {
                res.send({result: true});
            })
            .catch((e) => {
                console.error('deleteBill fail', e);
                sendError(res, e)
            });
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    updateBill(req, res) {
        const request = req.body;
        if (!request || !request.name) {
            throw Error('Some request parameters is empty');
        }
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new VirtualBillsService(userVo)).updateBill(
                req.params.id, 
                request.name,
                request.group_id ? request.group_id : null
                ))
            .then((bill) => {
                res.send({result: true, bill: bill});
            })
            .catch((e) => {
                console.error('updateBill fail', e);
                sendError(res, e)
            });
    }

}

const Api = new Api200();
router.get('/', Api.ping);
router.get('/user/me', Api.getUserByAuthToken);
router.put('/user/register', Api.registerBaseUser);
router.post('/user/login', Api.getUserByEmailPassword);
router.get('/bills', Api.getBills);
router.put('/bill', Api.createBill);
router.delete('/bill/:id', Api.deleteBill);
router.post('/bill/:id', Api.updateBill);

module.exports = router;
