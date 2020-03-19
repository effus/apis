'use strict';

const {getCollection, insertIntoCollection, updateInCollection} = require('../mongo');
const ObjectID = require('mongodb').ObjectID;
const {AuthService} = require('./AuthService');
const UserVo = require('../vo/UserVo');
const {TokenVo} = require('../vo/TokenVo');


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

    getUserVoByData(result) {
        let userVo = new UserVo(result._id);
        userVo.setBots(result.bots);
        userVo.setPermissions(result.permissions);
        userVo.setPersonalData(result.email, result.name);
        return userVo;
    }

    async getUserVoByRequest(req) {
        let token = '';
        if (req.headers.authorization) {
            token = req.headers.authorization.replace(/token/g, '').trim();
        }
        if (!token) {
            throw Error('Bad authorization token');
        }
        return await this.getUserByAuthToken(token);
    }

    /**
     * поиск юзера в коллекции
     * @param {*} params 
     */
    async findUser(params) {
        const collection = await getCollection('api_users');
        return new Promise((resolve, reject) => {
            try {
                collection.findOne(params, (err, user) => {
                    if (err) {
                        return reject(err);
                    }
                    console.debug('findUser', user);
                    resolve(user);
                });
            } catch(e) {
                reject(e);
            }
        });
    }

    async updateUser(params, userId) {
        const collection = await getCollection('api_users');
        
    }

    /**
     * получение юзера по токену
     * @param {string} token 
     */
    async getUserByAuthToken(token) {
        const tokenVo = new TokenVo(token);
        const result = await this.findUser({
            _id: new ObjectID(tokenVo.uid)
        });
        if (!result) {
            throw Error('User not found');
        }
        this.authService.validateToken(tokenVo, result.token, result.token_expires);
        return this.getUserVoByData(result);
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
        const userByEmail = await this.findUser({
            email: email
        });
        if (userByEmail) {
            throw Error('Email already registered');
        }
        const userByToken = await this.findUser({
            token: token
        });
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
        let object = {
            hashed_password: hashedPassword,
            email: email,
            name: name,
            bots: {},
            permissions: this.authService.getBaseUserPermissions(),
            flags: [],
            token: token
        };
        await this.checkUserExists(email, token);
        const insertResult = await insertIntoCollection('api_users', object);
        object._id = insertResult.insertedId;
        let vo = this.getUserVoByData(object);
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
        const result = await this.findUser({
            email: email
        });
        if (!result) {
            throw Error('User not found');
        }
        if (result.hashed_password !== hashedPassword) {
            //@todo ban if too much tries
            throw Error('Incorrect password');
        }
        const userId = result._id;
        result.token = this.authService.getToken();
        await updateInCollection('api_users', result, userId);
        let vo = this.getUserVoByData(result);
        vo.setToken(result.token);
        return vo;
    }
}

module.exports = UserService;