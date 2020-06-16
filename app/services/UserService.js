'use strict';

const {getCollection, insertIntoCollection, updateInCollection, getDocument} = require('../mongo');
const ObjectID = require('mongodb').ObjectID;
const {AuthService} = require('./AuthService');
const UserVo = require('../vo/UserVo');
const {TokenVo} = require('../vo/TokenVo');

const UserCollectonName = 'api_users';

const UserFlags = {
    EMAIL_VERIFIED: 1
};

class UserService {

    /**
     * @param AuthVo authVo 
     */
    constructor() {
        this.authService = new AuthService();
    }

    /**
     * @param {*} result 
     */
    getUserVo(result) {
        let userVo = new UserVo(result._id);
        userVo.setBots(result.bots);
        userVo.setPermissions(result.permissions);
        userVo.setPersonalData(result.email, result.name);
        if (result.bill_group_proportions) {
            userVo.setBillGroupProportions(result.bill_group_proportions);
        }
        return userVo;
    }

    /**
     * @param {*} id 
     */
    async getUser(id) {
        const document = await getDocument(
            UserCollectonName,
            {_id: new ObjectID(id)}
        );
        return this.getUserVo(document);
    }

    /**
     * получение данных о пользователе по запросу
     * @param {*} req 
     */
    async getUserVoByRequest(req) {
        let token = '';
        if (req.headers.authorization) {
            token = req.headers.authorization.replace(/token/g, '').trim();
        }
        if (!token) {
            throw Error('Bad authorization token');
        }
        const userVo = await this.getUserByAuthToken(token);
        console.debug('getUserVoByRequest', token, userVo);
        return userVo;
    }

    async updateUser(params, userId) {
        //const collection = await getCollection(UserCollectonName);
        //@todo
    }

    /**
     * получение юзера по токену
     * @param {string} token 
     */
    async getUserByAuthToken(token) {
        const tokenVo = new TokenVo(token);
        const document = await getDocument(
            UserCollectonName,
            {_id: new ObjectID(tokenVo.uid)}
        );
        if (!document) {
            throw Error('User not found');
        }
        this.authService.validateToken(tokenVo, document.token, document.token_expires);
        return this.getUserVo(document);
    }

    /**
     * проверка существования юзера
     * @param {string} email 
     * @param {string} token 
     * @return {Boolean}
     */
    async checkUserExists(email, token) {
        if (!email) {
            throw Error('Bad email');
        }
        if (!token) {
            throw Error('Bad token');
        }
        const userByEmail = await getDocument(
            UserCollectonName,
            {email: email}
        );
        if (userByEmail) {
            throw Error('Email already registered');
        }
        const userByToken = await getDocument(
            UserCollectonName,
            {token: token}
        );
        if (userByToken) {
            throw Error('User already exist');
        }
        return true;
    }

    /**
     * создание обычного пользователя
     * @param {string} email 
     * @param {string} name 
     * @param {string} password 
     */
    async registerBaseUser(email, name, password) {
        const hashedPassword = this.authService.securePassword(password);
        const token = this.authService.getToken();
        let expires = new Date();
        expires.setTime(new Date().getTime() + 60*60*24*7*1000);
        let object = {
            hashed_password: hashedPassword,
            email: email,
            name: name,
            bots: {},
            permissions: this.authService.getBaseUserPermissions(),
            flags: [],
            token: token,
            token_expires: expires
        };
        await this.checkUserExists(email, token);
        const insertResult = await insertIntoCollection(UserCollectonName, object);
        object._id = insertResult.insertedId;
        let vo = this.getUserVo(object);
        vo.setToken(token);
        return vo;
    }
    
    /**
     * получение юзера по емейлу-паролю
     * @param {string} email 
     * @param {string} password 
     */
    async getUserByEmailPassword(email, password) {
        const hashedPassword = this.authService.securePassword(password);
        const document = await getDocument(
            UserCollectonName,
            {email: email}
        );
        if (!document) {
            throw Error('User not found');
        }
        if (document.hashed_password !== hashedPassword) {
            //@todo ban if too much tries
            throw Error('Incorrect password');
        }
        const userId = document._id;
        document.token = this.authService.getToken();
        let expires = new Date();
        expires.setTime(new Date().getTime() + 60*60*24*7*1000);
        document.token_expires = expires;
        await updateInCollection(UserCollectonName, document, {
            _id: new ObjectID(userId)
        });
        let vo = this.getUserVo(document);
        vo.setToken(document.token);
        return vo;
    }

    /**
     * добавление бота в коллекцию
     * @param {*} botVo 
     * @param {*} userVo 
     */
    async buyBot(botVo, userVo) {
        let bots = userVo.bots ? userVo.bots : [];
        bots[botVo.id] = {};
        const updated = await updateInCollection(
            UserCollectonName, 
            {bots: bots}, 
            {_id: new Object(userVo.id)}
        );
        return {
            updatedCount: updated.modifiedCount,
            botVo: botVo,
            userVo: userVo
        }
    }

    /**
     * @param {BillGroupVo} groupVo 
     */
    async updateBillGroupProportions(userVo) {
        const updated = await updateInCollection(
            UserCollectonName, 
            {bill_group_proportions: userVo.bill_group_proportions}, 
            {_id: new Object(userVo.id)}
        );
        return {
            updatedCount: updated.modifiedCount,
            userVo: userVo
        }
    }

    /**
     * @param {string} userId 
     * @param {string} groupId 
     * @param {number|string} proportionValue 
     */
    async setBillGroupProportion(userId, groupId, proportionValue) {
        proportionValue = parseFloat(proportionValue);
        if (isNaN(proportionValue)) {
            throw new Error('bad proportion value');
        }
        if (proportionValue < 0.01 || proportionValue > 100) {
            throw new Error('proportion value out of range');
        }
        let userVo = await this.getUser(userId);
        let proportions = userVo.bill_group_proportions;
        proportions[groupId] = proportionValue;
        let totalProportions = 0;
        for (let i in proportions) {
            totalProportions += proportions[i];
        }
        if (totalProportions + proportionValue > 100) {
            throw new Error('total proportions sum greater than 100');
        }
        userVo.setBillGroupProportions(proportions);
        await this.updateBillGroupProportions(userVo);
        return userVo;
    }

}

module.exports = {UserService, UserCollectonName};
