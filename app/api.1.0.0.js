/**
 * API for Date simulator
 */

class Api100 {
    constructor(Db) {
        this.Db = Db;
    }

    /**
     * Register new user
     * @param {*} req 
     * @param {*} res 
     */
    register(req, res) {
        try {
            this.Db.connect().then((connect) => {
                connect.collection('users').find().toArray((err, results) => {
                    res.send({
                        users: results 
                    });
                });
            }).catch((e) => this.error(res, e));
        } catch (e) {
            this.error(res, e);
        }
    }

    error(res, exception) {
        res.send({error:true, message: exception.message});
    }
};

module.exports = Api100;