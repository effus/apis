'use strict';
const express = require('express');
const router = express.Router();
const {UserService} = require('./services/UserService.js');
const {VirtualBillsService} = require('./services/VirtualBillsService.js');
const {BillRevisionService} = require('./services/BillRevisionService.js');
const {BillGroupService} = require('./services/BillGroupService.js');

const sendError = (res, e) => {
    console.debug('error response', e);
    res.send({result: false, message: e.message});
}

class Api201 {
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
     * создание счета
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
            .then(async (billVo) => {
                const revision = await new BillRevisionService(billVo).createRevision("0.00");
                res.send({result: true, bill: billVo, revision});
            })
            .catch((e) => {
                console.error('createBill fail', e);
                sendError(res, e)
            });
    }

    /**
     * удаление счета
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
     * обновление счета
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

    /**
     * получение ревизий
     * @param {*} req 
     * @param {*} res 
     */
    getBillRevisions(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new VirtualBillsService(userVo)).getBill(req.params.id))
            .then((billVo) => (new BillRevisionService(billVo)).getBillRevisions(req.params.from))
            .then((revisions) => {
                res.send({result: true, revisions});
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
    getAllRevisions(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new VirtualBillsService(userVo)).getAllRevisions(req.params.from))
            .then((revisions) => {
                res.send({result: true, revisions});
            })
            .catch((e) => {
                console.error('getAllRevisions fail', e);
                sendError(res, e)
            });
    }

    /**
     * создание ревизии
     * @param {*} req 
     * @param {*} res 
     */
    createBillRevision(req, res) {
        const request = req.body;
        if (!request || !request.charge_amount) {
            console.debug('createBillRevision requwest', request);
            throw Error('Some request parameters is empty');
        }
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new VirtualBillsService(userVo)).getBill(req.params.id))
            .then((billVo) => (new BillRevisionService(billVo)).createRevision(
                request.charge_amount
            ))
            .then((revision) => {
                res.send({result: true, revision});
            })
            .catch((e) => {
                console.error('createBill fail', e);
                sendError(res, e)
            });
    }

    /**
     * получение последней ревизии по счету
     * @param {*} req 
     * @param {*} res 
     */
    getLastBillRevision(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new VirtualBillsService(userVo)).getBill(req.params.id))
            .then(async (billVo) =>  {
                const service = new BillRevisionService(billVo);
                const lastRevisionVo = await service.getLastRevision();
                console.debug('lastRevisionVo', lastRevisionVo);
                res.send({result: true, revision: lastRevisionVo});
            })
            .catch((e) => {
                console.error('createBill fail', e);
                sendError(res, e)
            });
    }


    /**
     * удаление последней ревизии
     * @param {*} req 
     * @param {*} res 
     */
    deleteLastRevision(req, res) {
        new UserService().getUserVoByRequest(req)
            .then((userVo) => (new VirtualBillsService(userVo)).getBill(req.params.id))
            .then(async (billVo) =>  {
                const service = new BillRevisionService(billVo);
                const lastRevisionVo = await service.getLastRevision();
                await service.deleteRevision(lastRevisionVo.id);
                res.send({result: true});
            })
            .catch((e) => {
                console.error('createBill fail', e);
                sendError(res, e)
            });
    }

    /**
     * перевод средств между счетами
     * @param {*} req 
     * @param {*} res 
     */
    setBillTransfer(req, res) {
        const request = req.body;
        if (!request || !request.amount) {
            throw Error('Some request parameters is empty');
        }
        new UserService().getUserVoByRequest(req)
            .then(async (userVo) =>  {
                const billService = new VirtualBillsService(userVo);
                const billVoFrom = await billService.getBill(req.params.from);
                const billVoTo = await billService.getBill(req.params.to);
                const transfer = await new BillRevisionService(billVoFrom).transfer(billVoTo, request.amount);
                res.send({result: true, transfer});
            })
            .catch((e) => {
                console.error('createBill fail', e);
                sendError(res, e)
            });
    }

    /**
     * создание группы счетов
     * @param {*} req 
     * @param {*} res 
     */
    createBillGroup(req, res) {
        const request = req.body;
        if (!request || !request.name || !request.color) {
            throw Error('Some request parameters is empty');
        }
        let userService = new UserService();
        userService.getUserVoByRequest(req)
            .then(async (userVo) => {
                try {
                    const groupService = new BillGroupService(userVo);
                    const groupVo = await groupService.createGroup(
                        request.name,
                        request.color,
                        request.included_bills,
                        request.main_bill_id
                    );
                    if (request.proportion) {
                        await userService.setBillGroupProportion(userVo.id, groupVo.id, request.proportion);
                        userVo = userService.getUserVoByRequest(req);
                    }
                    res.send({result: true, group: groupVo, bill_group_proportions: userVo.bill_group_proportions});
                } catch (e) {
                    console.error('createBillGroup fail', e);
                    sendError(res, e)
                }
            })
            .catch((e) => {
                console.error('createBillGroup fail', e);
                sendError(res, e)
            });
    }

    /**
     * список групп счетов
     */
    getBillGroups(req, res) {
        new UserService().getUserVoByRequest(req)
            .then(async (userVo) => {
                const groups = await (new BillGroupService(userVo)).getList();
                res.send({
                    result: true, 
                    groups: groups,
                    bill_group_proportions: userVo.bill_group_proportions
                });
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
    deleteBillGroup(req, res) {
        new UserService().getUserVoByRequest(req)
            .then(async (userVo) => {
                await (new BillGroupService(userVo)).deleteGroup(req.params.id);
                userVo = await new UserService().deleteBillGroupProportion(userVo.id, req.params.id);
                res.send({
                    result: true,
                    bill_group_proportions: userVo.bill_group_proportions
                });
            })
            .catch((e) => {
                console.error('deleteBillGroup fail', e);
                sendError(res, e)
            });
    }

    /**
     * @param {*} req 
     * @param {*} res 
     */
    updateBillGroup(req, res) {
        const request = req.body;
        let userService = new UserService();
        userService.getUserVoByRequest(req)
            .then(async (userVo) => {
                try {
                    const groupService = new BillGroupService(userVo);
                    const groupVo = await groupService.updateGroup(
                        req.params.id,
                        request.name,
                        request.color,
                        request.included_bills,
                        request.main_bill_id
                    );
                    if (request.proportion) {
                        await userService.setBillGroupProportion(userVo.id, groupVo.id, request.proportion);
                        userVo = userService.getUserVoByRequest(req);
                    }
                    res.send({result: true, group: groupVo, bill_group_proportions: userVo.bill_group_proportions});
                } catch (e) {
                    console.error('updateBillGroup fail', e);
                    sendError(res, e)
                }
            })
            .catch((e) => {
                console.error('updateBillGroup fail', e);
                sendError(res, e)
            });
    }
}

const Api = new Api201();
router.get('/', Api.ping);
router.get('/user/me', Api.getUserByAuthToken);
router.put('/user/register', Api.registerBaseUser);
router.post('/user/login', Api.getUserByEmailPassword);
router.get('/bills', Api.getBills);
router.put('/bill', Api.createBill);
router.delete('/bill/:id', Api.deleteBill);
router.post('/bill/:id', Api.updateBill);
router.get('/bill/:id/revisions/:from', Api.getBillRevisions);
router.get('/bills/revisions/:from', Api.getAllRevisions);
router.get('/bill/:id/revision/last', Api.getLastBillRevision);
router.put('/bill/:id/revisions', Api.createBillRevision);
router.delete('/bill/:id/revision', Api.deleteLastRevision);
router.post('/bill/transfer/:from/:to', Api.setBillTransfer);
router.put('/bill/groups', Api.createBillGroup);
router.get('/bill/groups', Api.getBillGroups);
router.delete('/bill/group/:id', Api.deleteBillGroup);
router.post('/bill/group/:id', Api.updateBillGroup);
module.exports = router;
