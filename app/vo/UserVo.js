'use strict';

class UserVo {
    constructor(id) {
        this.id = id;
        this.email = '';
        this.name = '';
        this.bots = {};
        this.permissions = [];
        this.bill_group_proportions = {};
    }

    setPersonalData(email, name) {
        this.email = email;
        this.name = name;
    }

    setBots(bots) {
        this.bots = bots;
    }

    setPermissions(permissions) {
        this.permissions = permissions;
    }

    setToken(token) {
        this.token = token;
    }

    setBillGroupProportions(proportions) {
        this.bill_group_proportions = proportions;
    }
}

module.exports = UserVo;
