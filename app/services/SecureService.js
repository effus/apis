'use strict';

const {hashSomething} = require('./AuthService.js');

const {truncateCollection} = require('../mongo.js');
const {ChatCollectonName} = require('./ChatService.js');
const {UserCollectonName} = require('./UserService.js');
const {BotsCollectonName} = require('./BotService.js');

const {updateInCollection} = require('../mongo');

class SecureService {

    checkSecureToken(salt, token) {
        const dt = new Date();
        const timeStr = String(dt.getFullYear()) + dt.getMonth() + dt.getDate();
        const control = hashSomething(salt + timeStr);
        if (token !== control) {
            console.error('SecureService.checkSecureToken', {salt, timeStr, control, token});
            throw Error('Invalid token');
        }
    }

    async resetDb(token) {
        this.checkSecureToken('SecureService.resetDb', token);
        await truncateCollection(ChatCollectonName);
        await truncateCollection(BotsCollectonName);
        await truncateCollection(UserCollectonName);
        return true;
    }

    async resetChats(token) {
        this.checkSecureToken('SecureService.resetChats', token);
        await truncateCollection(ChatCollectonName);
    }

    async resetDialogs(token) {
        this.checkSecureToken('SecureService.resetDialogs', token);
        await updateInCollection(
            BotsCollectonName,
            { 
                flag_publish: false,
                messages: []
            },
            {}
        );
    }

    async resetBots(token) {
        this.checkSecureToken('SecureService.resetBots', token);
        await truncateCollection(BotsCollectonName);
    }
}

module.exports = {SecureService};