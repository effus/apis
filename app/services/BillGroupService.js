'use strict';

const {getCollection, insertIntoCollection, updateInCollection, deleteInCollection, findMany, getDocument} = require('../mongo');
const {BillGroupVo} = require('../vo/BillGroupVo.js');
const ObjectID = require('mongodb').ObjectID;
const {VirtualBillsService} = require('./VirtualBillsService.js');

const BillGroupCollectonName = 'api_bill_groups';

class BillGroupService {

    /**
     * @param UserVo userVo 
     */
    constructor(userVo) {
        this.userVo = userVo;
    }

    
    /**
     * 
     */
    async getDocuments() {
        return await findMany(BillGroupCollectonName, {owner: new ObjectID(this.userVo.id)});
    }


    /**
     * @param {*} id 
     */
    async getGroup(id) {
        const document = await getDocument(
            BillGroupCollectonName,
            {_id: new ObjectID(id), owner: new ObjectID(this.userVo.id)}
        );
        return new BillGroupVo(document);
    }

    /**
     * @param {*} name 
     * @param {*} color 
     */
    async createGroup(name, color, bills, mainBillId) {
        let object = {
            owner: this.userVo.id,
            version: 0,
            name: name,
            created_at: new Date(),
            last_update: new Date(),
            color: color,
            included_bills: bills,
            main_bill_id: mainBillId,
            expected_sum: 0
        };
        if (!Array.isArray(bills)) {
            bills = [];
        }
        if (bills.length > 0 && !bills.includes(mainBillId)) {
            throw new Error('Main bill not included in bills array');
        }
        const existedGroup = await findMany(
            BillGroupCollectonName, 
            {owner: new ObjectID(this.userVo.id), name: name}
        );
        if (existedGroup.length > 0) {
            throw new Error('Group with same name already existed');
        }
        const insertResult = await insertIntoCollection(BillGroupCollectonName, object);
        object._id = insertResult.insertedId;
        return new BillGroupVo(object);
    }

    /**
     * @param {*} id 
     * @param {*} name 
     * @param {*} color 
     * @param {*} bills 
     * @param {*} mainBillId 
     */
    async updateGroup(id, name, color, bills, mainBillId) {
        const groupVo = await this.getGroup(id);
        let group = {};
        if (name) {
            group.name = name;
        }
        if (color) {
            group.color = color;
        }
        if (bills) {
            if (!Array.isArray(bills)) {
                throw new Error('Included bills not an array');
            }
            const existedBills = (await (new VirtualBillsService(this.userVo)).getBills()).map(bill => bill.id+'');
            bills = bills.filter( (item, pos) => bills.indexOf(item) === pos );
            for (let i in bills) {
                if (!existedBills.includes(bills[i])) {
                    throw new Error('One of included bills is not existed');
                }
            }
            group.included_bills = bills;
            groupVo.included_bills = bills;
        }
        if (mainBillId) {
            if (groupVo.included_bills.length === 0) {
                throw new Error('Included bills list is empty');
            }
            if (!groupVo.included_bills.includes(mainBillId)) {
                throw new Error('Main bill not included in bills array');
            }
            group.main_bill_id = mainBillId;
        }
        await updateInCollection(
            BillGroupCollectonName, 
            group, 
            {
              _id: ObjectID(id)
            }
        );
        return await this.getGroup(id);
    }

    /**
     * @param {*} id 
     */
    async deleteGroup(id) {
        await this.getGroup(id);
        await updateInCollection(BillGroupCollectonName, {
            owner: null
        }, {
            _id: ObjectID(id)
        });
        return true;
    }

    /**
     * 
     */
    async getList() {
        const documents = await this.getDocuments();
        let result = [];
        for (let i in documents) {
            let vo = new BillGroupVo(documents[i]);
            if (this.userVo.bill_group_proportions[vo.id]) {
                vo.setProportion(this.userVo.bill_group_proportions[vo.id]);
            }
            result.push(vo);
        }
        return result;
    }

    async addBillToGroup() {
    }

    async removeBillFromGroup() {
    }

}

module.exports = {BillGroupService, BillGroupCollectonName};
