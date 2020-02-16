'use strict';

const router = express.Router();

class Api100 {
    constructor(Db) {
        this.Db = Db;
    }

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
        console.log('register', this);
        res.send({wtf:true});
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
