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
        this.res = res;
        this.Db.connect().then((connect) => {
            const users = connect.collection('users');
            users.find().toArray((err, results) => {
                res.send({
                    users: results 
                });
            });
        }).catch(this.error);
    }

    error(exception) {
        this.res.send({error:true, message: exception.message});
    }
};

module.exports = Api100;