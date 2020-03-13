'use strict';

//const {getCollection, insertIntoCollection} = require('../mongo');
const crypto = require('crypto');

const AuthPermissions = {
    USER_LIST: 10,
    USER_CREATE: 11,
    USER_READ: 12,
    USER_UPDATE: 13,
    SELF_UPDATE: 14,
    USER_DELETE: 15,
    USER_GRANT: 16,
    SELF_LOGIN: 17,
    BOT_LIST: 21,
    BOT_CHAT: 22,
    BOT_ADD: 23
};

const hashSomething = (str) => {
    return crypto.createHash('sha256').update(str).digest('hex');
}

/**
 * 
 */
class AuthService {
    constructor() {

    }

    getBaseUserPermissions() {
        return [
            AuthPermissions.SELF_UPDATE,
            AuthPermissions.SELF_LOGIN,
            AuthPermissions.BOT_LIST,
            AuthPermissions.BOT_ADD,
            AuthPermissions.BOT_CHAT
        ];
    }

    getToken() {
        return hashSomething(new Date().toString());
    }

    /**
     * @param {TokenVo} tokenVo 
     * @param {string} originToken 
     * @param {string} tokenExpires 
     */
    validateToken(tokenVo, originToken, tokenExpires) {
        const control = hashSomething(tokenVo.timestamp + originToken);
        console.debug('Token control hash', control);
        if (control !== tokenVo.hash) {
            throw Error('Invalid token');
        }
        const tokenExpireTime = new Date(tokenExpires);
        if (tokenExpireTime < new Date()) {
            throw Error('Token expired');
        }
        return true;
    }

    securePassword(password) {
        return hashSomething(password);
    }

    canReadUserList(userVo) {

    }
}

module.exports = {AuthService, AuthPermissions};