class Api100 {
    register(req, res) {
        res.send({
            vers:'1.0.0'
        });
    }
};

modules.export = Api100;