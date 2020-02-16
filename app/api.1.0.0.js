/**
 * API for Date simulator
 */

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

    /**
     * Register new user
     * @param {*} req 
     * @param {*} res 
     */
    register(req, res) {
        this.getCollection('users').then((collection) => {
            res.send({
                users: results 
            });
        }).catch((e) => {
            console.log('Api1.0.0:register error', e);
            res.send({error:true});
        });
            // .find().toArray((err, results) => {
                
            // });
        //})
        
    }

    error(res, exception) {
        res.send({error:true, message: exception.message});
    }
};

module.exports = Api100;