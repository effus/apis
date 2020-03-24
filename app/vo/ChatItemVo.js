'use strict';

class ChatItemVo {
    constructor(reply, cases, selected, sendAt) {
        this.id = new Date().getTime();
        this.reply = reply;
        this.cases = cases;
        this.selected = selected;
        this.sendAt = sendAt;
    }
}

module.exports = {ChatItemVo};