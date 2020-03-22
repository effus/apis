'use strict';

class ChatVo {
    constructor(document) {
        this.id = document._id;
        this.userId = document.user_id;
        this.botId = document.bot_id;
        this.messages = document.messages;
    }
}

module.exports = {ChatVo};