'use strict';

const {getCollection, insertIntoCollection, updateInCollection} = require('../mongo');
const {BillRevisionVo} = require("../vo/BillRevisionVo");
const {ObjectID, ISODate} = require('mongodb');
const _ = require('lodash');

const BillRevisionCollectonName = 'api_bill_revisions';

class BillRevisionService {
    
    /**
     * @param {VirtualBillVo} billVo 
     */
    constructor(billVo) {
        this.billVo = billVo;
    }

    /**
     * @param {*} params 
     */
    async findMany(params) {
        const collection = await getCollection(BillRevisionCollectonName);
        return collection.find(params).toArray();
    }

    /**
     * @param {*} params 
     */
    async getDocuments(params) {
        return await this.findMany(params);
    }

    /**
     * @param {*} id 
     */
    async getDocument(id) {
        const documents = await this.findMany({
            _id: new ObjectID(id),
            bill_id: new ObjectID(this.billVo.id)
        });
        if (documents.length === 0) {
            throw Error('Document not found');
        }
        return documents[0];
    }

    /**
     * @param {*} id 
     */
    async getRevision(id) {
        const document = await this.getDocument(id);
        return new BillRevisionVo(document);
    }

    /**
     * 
     */
    async getLastRevision() {
        const documents = await this.getDocuments({
            bill_id: new ObjectID(this.billVo.id)
        });
        if (documents.length === 0) {
            return null;
        }
        return new BillRevisionVo(documents[documents.length - 1]);
    }

    /**
     * @param {*} fromDate 
     */
    async getRevisions(fromDate) {
        let searchParams = {
            bill_id: new ObjectID(this.billVo.id),
            inserted_at: { "$gt": new Date(fromDate) }
        };
        console.debug('getRevisions', searchParams);
        const documents = await this.getDocuments(searchParams);
        let result = [];
        for (let i in documents) {
            result.push(new BillRevisionVo(documents[i]));
        }
        return result;
    }

    /**
     * @param {*} chargeAmount 
     * @param {*} balanceAmount 
     */
    async createRevision(chargeAmount) {
        if (typeof chargeAmount !== 'string') {
            throw Error('amount values must be in string type');
        }
        chargeAmount = parseFloat(chargeAmount);
        if (isNaN(chargeAmount)) {
            throw Error('charge amount is not a number');
        }
        
        const lastRevision = await this.getLastRevision();
        let balanceAmount = lastRevision ? parseFloat(lastRevision.balance_amount) : 0;
        balanceAmount = _.round(_.add(balanceAmount, chargeAmount), 2);

        let object = {
            bill_id: this.billVo.id,
            inserted_at: new Date(),
            charge_amount: chargeAmount.toFixed(2),
            balance_amount: balanceAmount.toFixed(2)
        };
        const insertResult = await insertIntoCollection(BillRevisionCollectonName, object);
        object._id = insertResult.insertedId;
        return new BillRevisionVo(object);
    }

    /**
     * @param {*} id 
     */
    async deleteRevision(id) {
        let document = await this.getDocument(id);
        document.linked_bill = this.billVo.id;
        document.bill_id = null;
        await updateInCollection(
            BillRevisionCollectonName,
            document,
            {_id: new ObjectID(id)}
        );
    }

    /**
     * @param {*} billVoTo 
     * @param {*} transferAmount 
     */
    async transfer(billVoTo, transferAmount) {
        if (typeof transferAmount !== 'string') {
            throw Error('amount values must be in string type');
        }
        transferAmount = parseFloat(transferAmount);
        if (isNaN(transferAmount)) {
            throw Error('transfer amount is not a number');
        }
        if (transferAmount <= 0) {
            throw Error('transfer amount is 0');
        }
        let lastRevision = await this.getLastRevision();
        let fromBalanceAmount = lastRevision ? parseFloat(lastRevision.balance_amount) : 0;
        if (fromBalanceAmount < transferAmount) {
            throw Error('transfer amount is too large for that bill');
        }
        fromBalanceAmount = _.round(_.subtract(fromBalanceAmount, transferAmount), 2);
        let fromObject = {
            bill_id: this.billVo.id,
            inserted_at: new Date(),
            charge_amount: (transferAmount * -1).toFixed(2),
            balance_amount: fromBalanceAmount.toFixed(2)
        };
        await insertIntoCollection(BillRevisionCollectonName, fromObject);
        this.billVo = billVoTo;
        lastRevision = await this.getLastRevision();
        let toBalanceAmount = lastRevision ? parseFloat(lastRevision.balance_amount) : 0;
        toBalanceAmount = _.round(_.add(toBalanceAmount, transferAmount), 2);
        let toObject = {
            bill_id: billVoTo.id,
            inserted_at: new Date(),
            charge_amount: transferAmount.toFixed(2),
            balance_amount: toBalanceAmount.toFixed(2)
        };
        await insertIntoCollection(BillRevisionCollectonName, toObject);
        return {
            from: new BillRevisionVo(fromObject),
            to: new BillRevisionVo(toObject)
        }
    }
}


module.exports = {BillRevisionService, BillRevisionCollectonName};
