'use strict';

class BillGroupVo {

    constructor(object) {
        this.id = object._id;
        this.name = object.name;
        this.color = object.color;
        this.included_bills = object.included_bills ? object.included_bills : [];
        this.main_bill_id = object.main_bill_id;
        this.expected_sum = object.expected_sum;
    }

    setProportion(proportion) {
        this.proportion = proportion;
    }
}

module.exports = {BillGroupVo};
