'use strict';

class ChatItemVo {
    constructor(reply, messageId, cases, selected, sendAt) {
        this.id = new Date().getTime();
        this.messageId = messageId;
        this.reply = reply;
        this.cases = cases;
        this.selected = selected;
        this.sendAt = sendAt;
    }
}

module.exports = {ChatItemVo};