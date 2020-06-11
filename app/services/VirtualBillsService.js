'use strict';

const {getCollection, insertIntoCollection, updateInCollection} = require('../mongo');
const {VirtualBillVo} = require("../vo/VirtualBillVo");
const ObjectID = require('mongodb').ObjectID;

const BillsCollectonName = 'api_bills';

class VirtualBillsService {
    
    /**
     * @param UserVo userVo 
     */
    constructor(userVo) {
        this.userVo = userVo;
    }

    /**
     * @param {*} params 
     */
    async findMany(params) {
        const collection = await getCollection(BillsCollectonName);
        return collection.find(params).toArray();
    }

    /**
     * 
     */
    async getDocuments() {
        return await this.findMany({
            owner: new ObjectID(this.userVo.id)
        });
    }

    /**
     * @param {*} id 
     */
    async getDocument(id) {
        const documents = await this.findMany({
            _id: new ObjectID(id),
            owner: new ObjectID(this.userVo.id)
        });
        console.debug('getDocument', id, this.userVo.id, documents);
        if (documents.length === 0) {
            throw Error('Document not found');
        }
        return documents[0];
    }

    /**
     * @param {*} id 
     */
    async getBill(id) {
        const document = await this.getDocument(id);
        return new VirtualBillVo(document);
    }

    /**
     * 
     */
    async getBills() {
        const documents = await this.getDocuments();
        let result = [];
        for (let i in documents) {
            result.push(new VirtualBillVo(documents[i]));
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
        let document = await this.getDocument(id);
        console.debug('deleteBill', document);
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
