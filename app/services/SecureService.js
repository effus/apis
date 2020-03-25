'use strict';

const {hashSomething} = require('./AuthService.js');

const {truncateCollection} = require('../mongo.js');
const {ChatCollectonName} = require('./ChatService.js');
const {UserCollectonName} = require('./UserService.js');
const {BotsCollectonName} = require('./BotService.js');

class SecureService {

    async resetDb(token) {
        const dt = new Date();
        const timeStr = dt.getFullYear() + dt.getMonth() + dt.getDate() + dt.getHours();
        const control = hashSomething('SecureService.resetDb' + timeStr);
        if (token !== control) {
            console.error('SecureService.resetDb', timeStr, control, token);
            throw Error('Invalid token');
        }
        await truncateCollection(ChatCollectonName);
        await truncateCollection(BotsCollectonName);
        await truncateCollection(UserCollectonName);
        return true;
    }
}

module.exports = {SecureService};