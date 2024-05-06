const { default: mongoose } = require('mongoose');
const mogoose  = require('mongoose');
const mongoUri = "mongodb://localhost:27017/";

const connectToMongo = () => {
    mongoose.connect( mongoUri );
}

module.exports = connectToMongo;