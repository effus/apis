class Api100 {
    register(req, res) {
        res.send({
            vers:'1.0.0'
        });
    }
};

module.exports = Api100;