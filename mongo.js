const mongoose = require('mongoose');
const env = process.env.NODE_ENV;
const config = require('./mongo.json')[env];

module.exports = () => {
    const envUrl = process.env[config.use_env_variable];
    return mongoose.connect(mongoUrl);
}