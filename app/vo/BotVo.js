'use strict';

class BotVo {

    constructor(object) {
        this.id = object._id;
        this.name = object.name;
        this.gender = object.gender;
        this.photoUrl = object.photo_url;
        this.flagPublish = object.flag_publish;
    }

    setAuthor(userVo) {
        this.author = userVo;
    }

    setMessages(messages) {
        this.messages = messages ? messages : [];
    }

    /**
     * @param {*} messageCount 
     * @param {*} dialogsCount 
     * @param {*} medianUserProgress 
     * @param {*} price 
     */
    setStatistic(messageCount, dialogsCount, medianUserProgress, price) {
        this.stat = {
            messageCount: messageCount,
            dialogsCount: dialogsCount,
            medianUserProgress: medianUserProgress,
            price: price
        }
    }

    /**
     * @param {*} isPurchased 
     */
    setMarketProperties(isPurchased) {
        this.market = {
            isPurchased: isPurchased
        };
    }

    /**
     * 0 - бот недоступен
     * 1 - бот онлайн
     * 2 - бот оффлайн
     * 3 - бот пишет сообщение
     * @param {number} status 
     */
    setStatus(status) {
        this.status = status;
    }
}

module.exports = {BotVo};