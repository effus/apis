'use strict';

class UserVo {
    constructor(email, hash, name) {
        this.email = email;
        this.hash = hash;
        this.name = name;
        this.bots = {};
        this.devices = []; //@todo
    }
}
module.exports = UserVo;