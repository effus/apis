'use strict';

class VirtualBillVo {
    constructor(object) {
        this.id = object._id;
        this.owner = object.owner;
        this.version = object.version;
        this.name = object.name;
        this.last_update = object.last_update;
        this.group_id = object.group_id;
    }

    /**
     * @param {BillRevisionVo} lastRevision 
     */
    setLastRevision(lastRevision) {
        this.lastRevision = lastRevision;
    }
}

module.exports = {VirtualBillVo};
