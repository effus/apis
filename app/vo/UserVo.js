'use strict';

class UserVo {
    constructor(email, hash, name) {
        this.email = email;
        this.hash = hash;
        this.name = name;
        this.bots = {}
    }
}
module.exports = UserVo;