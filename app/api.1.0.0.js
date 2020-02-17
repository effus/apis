'use strict';
const express = require('express');
const router = express.Router();
const Db = require('./mongo.js');

class Api100 {
    
    getCollection(name) {
        return new Promise((resolve, reject) => {
            this.Db.connect().then((connect) => {
                resolve(connect.collection(name));
            }).catch(reject);
        });
    }

    register(req, res) {
        // getCollection('users').then((collection) => {
        //     res.send({
        //         users: results 
        //     });
        // }).catch((e) => {
        //     console.log('Api1.0.0:register error', e);
        //     res.send({error:true});
        // });
            // .find().toArray((err, results) => {
                
            // });
        //})
        Db.connect().then((client) => {
            //const users = connect.collection('users');
            
            console.log('register', client.collection('users'));
            res.send({wtf:true});
        }).catch((e) => {
            console.debug('error', e);
        });
        
    }

};

const Api = new Api100();

router.get('/user/register', Api.register);

/**
 * API for Date simulator
 */

/*

module.exports = Api100; */

module.exports = router
