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
        this.botStatus = document.botStatus;
    }

    /**
     * @param {*} points 
     */
    setPoints(points) {
        this.points = points;
    }

    /**
     * @param {*} status 
     */
    setBotStatus(status) {
        this.botStatus = status;
    }
}

module.exports = {ChatVo};