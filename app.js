const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
var cors = require('cors')

app.use(bodyParser.json());
app.use(cors());


/*
* SOCKET IO
*/

const socket = require('socket.io');
const server = app.listen(3000);
global.io = socket.listen(server);
module.exports = io;


/*
* SOCKET IO
*/



const userRoutes = require('./routes/UserRoute');
const devicesRoutes = require('./routes/DevicesRoute');



app.use('/api/users', userRoutes);
app.use('/api/Devices', devicesRoutes);
app.use( express.static( "config" ) );


mongoose.connect('mongodb://127.0.0.1:27017/DB_PFE',
    {
        useCreateIndex: true,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, () =>
        console.log('DataBase is connected ')
);








// app.listen(3000,'192.168.56.199');
// app.listen(3000,'192.168.1.20');
app.listen(3000,'192.168.43.181');

// app.listen(3000,'192.168.56.247');
