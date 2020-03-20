'use strict';

class BotVo {

    constructor(object) {
        this.id = object._id;
        this.name = object.name;
        this.gender = object.gender;
        this.photoUrl = object.photoUrl;
        this.flag_publish = object.flag_publish;
    }

    setAuthor(userVo) {
        this.author = userVo;
    }

    setMessages(messages) {
        this.messages = messages ? messages : [];
    }
}

module.exports = {BotVo};