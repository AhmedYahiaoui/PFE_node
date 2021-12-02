var mongoose = require('mongoose');

var DevicesSchema = new mongoose.Schema({

    title: {
        type: String,
        unique: true,
        required: true,
    },
    favorit: {
        type: Boolean,
    },
    traking: {
        type: Boolean,
    },
    ref: {
        type: String,
        required: true,
        unique: true,
    },
    date_published: {
        type: String,
    },
    category :{
        type: String,
        required: true,
    },
    author :{
        type: mongoose.Schema.Types.ObjectId,
    },
    datas : [],


});



var Devices = mongoose.model('Devices', DevicesSchema);
module.exports = Devices;
