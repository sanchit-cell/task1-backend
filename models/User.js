const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    facebookId: String,
    name: String,
    picture: String,
    accessToken: String
});

module.exports = mongoose.model('User', userSchema);


