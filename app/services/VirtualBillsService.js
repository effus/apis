'use strict';

const {getCollection, insertIntoCollection, updateInCollection, getDocument, findMany} = require('../mongo');
const {VirtualBillVo} = require("../vo/VirtualBillVo");
const ObjectID = require('mongodb').ObjectID;
const {BillRevisionService} = require('./BillRevisionService.js');
const {BillRevisionVo} = require('../vo/BillRevisionVo');

const BillsCollectonName = 'api_bills';

class VirtualBillsService {
    
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
        return await findMany(BillsCollectonName, {owner: new ObjectID(this.userVo.id)});
    }


    /**
     * @param {*} id 
     */
    async getBill(id) {
        const document = await getDocument(
            BillsCollectonName,
            {_id: new ObjectID(id), owner: new ObjectID(this.userVo.id)}
        );
        return new VirtualBillVo(document);
    }

    /**
     * 
     */
    async getBills() {
        const documents = await this.getDocuments();
        let result = [];
        const billsIds = documents.map(item => item._id);
        const revisionService = new BillRevisionService();
        let lastRevisions = await revisionService.getLastRevisionsOfBills(billsIds); 

        for (let i in documents) {
            let vo = new VirtualBillVo(documents[i]);
            if (typeof lastRevisions[vo.id] !== 'undefined') {
                vo.setLastRevision(new BillRevisionVo({
                    inserted_at: lastRevisions[vo.id].dt,
                    charge_amount: lastRevisions[vo.id].charge,
                    balance_amount: lastRevisions[vo.id].balance
                }));
            }
            result.push(vo);
        }
        return result;
    }

    /**
     * @param {*} name 
     */
    async createBill(name) {
        let object = {
            owner: this.userVo.id,
            version: 0,
            name: name,
            last_update: new Date(),
            group_id: null
        };
        const insertResult = await insertIntoCollection(BillsCollectonName, object);
        object._id = insertResult.insertedId;
        return new VirtualBillVo(object);
    }

    /**
     * @param {*} id 
     * @param {*} name 
     * @param {*} groupId 
     */
    async updateBill(id, name, groupId) {
        let bill = await this.getBill(id);
        bill.name = name;
        bill.group_id = groupId;
        bill.version++;
        bill.last_update = new Date();
        const updateResult = await updateInCollection(
            BillsCollectonName,
            bill,
            {_id: new ObjectID(id)}
        );
        return {
            updatedCount: updateResult.modifiedCount,
            bill: bill
        };
    }

    /**
     * @param {*} id 
     */
    async deleteBill(id) {
        let document = await getDocument(
            BillsCollectonName,
            {_id: new ObjectID(id), owner: new ObjectID(this.userVo.id)}
        );
        document.last_update_user = this.userVo.id;
        document.last_update = new Date();
        document.version++;
        document.owner = null;
        await updateInCollection(
            BillsCollectonName,
            document,
            {_id: new ObjectID(id)}
        );
    }
}


module.exports = {VirtualBillsService, BillsCollectonName};
