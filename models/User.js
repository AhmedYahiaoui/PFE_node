var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({


    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    username: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
    },
    password2: {
        type: String,
        required: true,
    },
    numTel :{
        type: Number,
        required: true,
    },
    is_active :{
        type: Boolean,
    },
    date_joined :{
        type: String,
    },
    fcm_token :{
        type: String,
    },

});



var User = mongoose.model('User', UserSchema);
module.exports = User;
