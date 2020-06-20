'use strict';
const express = require('express');
const router = express.Router();
const {BAPService} = require('./services/BAPService.js');

const sendError = (res, e) => {
    console.debug('error response', e);
    res.send({result: false, message: e.message});
}

class Api30 {
    ping(req, res) {
	    res.send({result:true});
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    async addFirstname(req, res) {
        try {
            const request = req.body;
            const bot = (new BAPService).insertFirstname(request.name);
            res.send({result: true});
        } catch (e) {
            console.error('newBot fail', e);
            sendError(res, e)
        }
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    async addLastname(req, res) {
        try {
            const request = req.body;
            const bot = (new BAPService).insertLastname(request.name);
            res.send({result: true});
        } catch (e) {
            console.error('newBot fail', e);
            sendError(res, e)
        }
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    async newBot(req, res) {
        try {
            const bot = await (new BAPService).newBot();
            res.send({result: true, bot: bot});
        } catch (e) {
            console.error('newBot fail', e);
            sendError(res, e)
        }
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    async updateBot(req, res) {
        try {
            const request = req.body;
            await (new BAPService).confirmRegistration(req.params.id, request.registered);
            res.send({result: true});
        } catch (e) {
            console.error('newBot fail', e);
            sendError(res, e)
        }
    }
}

const Api = new Api30();
router.get('/', Api.ping);
router.put('/legion', Api.newBot);
router.post('/legion/:id', Api.updateBot);
router.put('/names/first_name', Api.addFirstname);
router.put('/names/last_name', Api.addLastname);
module.exports = router;
