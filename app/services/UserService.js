'use strict';

const {getCollection, insertIntoCollection, updateInCollection} = require('../mongo');
const UserVo = require('../vo/UserVo');
const ObjectID = require('mongodb').ObjectID;
const {AuthService, hashSomething} = require('./AuthService');



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
        const hashes = token.split(':');
        if (hashes.length !== 2) {
            throw Error('Bad token format');
        }
        const result = await this.findUser({
            _id: new ObjectID(hashes[0])
        });
        if (!result) {
            throw Error('User not found');
        }
        this.authService.validateToken(hashes[0], result.token, hashes[1], result.token_expires);
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
            email: email,
            hashed_password: hashedPassword
        });
        if (!result) {
            throw Error('User not found');
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