'use strict';

class ChatVo {

    /**
     * @param {*} document 
     */
    constructor(document) {
        this.id = document._id;
        this.userId = document.user_id;
        this.botId = document.bot_id;
        this.messages = document.messages;
        this.points = document.points;
        this.status = document.status;
    }

}

module.exports = {ChatVo};