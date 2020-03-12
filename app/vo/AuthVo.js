'use strict';

class AuthVo {

    constructor(userPermission) {
        if (!AuthPermissions[userPermission]) {
            throw Error('Bad userPermission value');
        }
        this.userPermission = userPermission;
    }
}

module.exports = {AuthVo};