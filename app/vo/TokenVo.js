'use strict';

class TokenVo {

    constructor(token) {
        const struct = token.split(':');
        if (struct.length !== 3) {
            throw Error('Bad token format');
        }
        this.uid = struct[0];
        this.timestamp = struct[1];
        this.hash = struct[2];
    }

    /*get uid() {
        return this.uid;
    }

    get timestamp() {
        return this.timestamp;
    }

    get hash() {
        return this.hash;
    }*/
}

module.exports = {TokenVo};