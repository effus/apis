'use strict';

class BillRevisionVo {
    constructor(object) {
        this.id = object._id;
        this.bill_id = object.bill_id;
        this.inserted_at = object.inserted_at;
        this.charge_amount = object.charge_amount;
        this.balance_amount = object.balance_amount;
    }
}

module.exports = {BillRevisionVo};
