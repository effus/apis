'use strict';

class UserVo {
    constructor(email, passwordHash, name) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.name = name;
        this.bots = {}
    }
}
module.exports = UserVo;