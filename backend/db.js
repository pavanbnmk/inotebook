const { default: mongoose } = require('mongoose');
const mogoose  = require('mongoose');
const mongoUri = "mongodb://0.0.0.0:27017";

const connectToMongo = () => {
    mongoose.connect( mongoUri );
}

module.exports = connectToMongo;