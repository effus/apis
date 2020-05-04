'use strict';

class ChatItemVo {
    constructor(reply, messageId, points) {
        this.id = new Date().getTime();
        this.messageId = messageId;
        this.reply = reply;
        this.selected = null;
        this.sendAt = null;
        this.points = points;
    }
}

module.exports = {ChatItemVo};