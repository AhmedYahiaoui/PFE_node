
const express = require('express');
const Path =express.Router();
const Devices  = require('../models/Devices');
const User  = require('../models/User');
var kafka = require('kafka-node');
var NoKafka = require('no-kafka');

const authenticateJWT = require('../middleware/auth');

const Nexmo = require('nexmo');
const nodemailer = require("nodemailer");
var dateFormat = require('dateformat');
var colors = require('colors');


const opencage = require('opencage-api-client');
var NodeGeocoder = require('node-geocoder');
var geocoding = require('reverse-geocoding');

const ejs = require("ejs");

// var TMClient = require('textmagic-rest-client');

var bodyParser = require('body-parser');

Path.use(bodyParser.json());
Path.use(bodyParser.urlencoded());
// in latest body-parser use like below.
Path.use(bodyParser.urlencoded({ extended: true }));

// notif push
var adminss = require("firebase-admin");
var serviceAccount = require("../firebaseconf.json");
adminss.initializeApp({
    credential: adminss.credential.cert(serviceAccount),
    databaseURL: "https://sample-project-e1a84.firebaseio.com"
});
const _ = require('lodash');
const lodash = require('lodash');
const moment= require('moment');

// const  firebase = require('firebase-admin');

// ********************    CRUD   ******************



//Detail find by ID
Path.get('/:id',authenticateJWT,async (req,res) => {
    au = await Devices.findOne({author : req.id , _id :req.params.id});

    if(!au)
    {
        console.log("mech mte3ek");
        return res.status(400).json({err:"not exist"});
    }
    else
    {
        console.log('Device s name is :  ',au.title);
        return res.json(au);
    }
});


//Detail find data by ID
Path.get('/dataof/:id',authenticateJWT,async (req,res) => {
    au = await Devices.findOne({author : req.id , _id :req.params.id});
    // console.log('Device s name w data mte3o .. zaGrtoooo ya  ' + au.title );
    if(!au)
    {
        console.log("mech mte3ek");
        return res.status(400).json({err:"not exist"});
    }
    else
    {
        // devices_datas = au.forEach(element =>
        //     element.datas.reverse()
        // );

        devices_datas = au.datas.reverse() ;

        // console.log(' ***** devices_datas   : ',devices_datas.time);
        return res.status(200).json(devices_datas);
    }
});



// New Device
Path.post('/AddDevice', authenticateJWT, async (req, res) => {
    let devices = new Devices({
        author: req.id,
        title:req.body.title,
        favorit:false,
        traking:false,
        ref:req.body.ref,
        date_published:Date.now(),
        category:req.body.category,
    });
    console.log(req.id);
    try {
        await devices.save();
        res.json({status: "ok", message: 'Device added'});
    } catch (err) {
        res.json({message: err.message});
    }
});



// Remove Device
Path.delete('/RemoveDevice/:id', authenticateJWT,async (req, res) => {

    au = await Devices.findOne({author : req.id , _id :req.params.id});
    if(au) {
        Devices.findByIdAndRemove(req.params.id)
            .then(device => {
                if (!device) {
                    return res.status(404).send({
                        message: "Device not found"
                    });
                } else {
                    return res.status(200).send({
                        message: "Device deleted"
                    });
                }
            })
    }
    else {
        return res.status(404).send({
            message: "you can not delete it"
        });
    }

});



// Update Device dentified by the Id in the request
Path.put('/UpdateDevice/:id',authenticateJWT,async (req, res) => {

    au = await Devices.findOne({author : req.id  , _id :req.params.id});
    console.log(au);
    if(!au) {

        return res.status(404).send({
            message: "you can not update it"
        });

    }
    else {

        // Validate Request title
        if (!req.body.title) {
            return res.status(400).send({
                message: "Device title can not be empty"
            });
        }
        // Validate Request ref
        if (!req.body.ref) {
            return res.status(400).send({
                message: "Device ref can not be empty"
            });
        }
        // Validate Request category
        if (!req.body.category) {
            return res.status(400).send({
                message: "Device category can not be empty"
            });
        }


        // Find Device and update it with the request body
        Devices.findByIdAndUpdate(
            req.params.id, {
                title: req.body.title || "Untitled Device",
                ref: req.body.ref || " Unreferenced Device",
                category: req.body.category || " Uncategorized Device"
            }, {new: true})
            .then(device => {
                if (!device) {
                    return res.status(404).send({
                        message: "Device not found with id " + req.params.id
                    });
                }
                res.send(device);
            }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Device not found with id " + req.params.id
                });
            }
            return res.status(500).send({
                message: "Error updating Device with id " + req.params.id
            });
        });
    }

});




// ********************    Filters   ******************


// find all by user
Path.post('/All_device_by_user', authenticateJWT, async (req, res) => {
    try {
        all_devices = await Devices.find({author: req.id});
        console.log("9a3ed yjib f data ");


        all_devices.forEach(element =>
            element.datas.reverse()
        );


        res.json(all_devices);
    } catch (err) {
        res.json({message: err.message});
    }
});



// find all by user
Path.post('/All_device_by_user_chart', authenticateJWT, async (req, res) => {
    try {
        all_devices = await Devices.find({author: req.id});
        console.log("9a3ed yjib f data ");




        var list = [];
        var data = [];
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // all_devices.forEach(element =>
        //
        //      element.datas.forEach(item =>
        //
        //          monthNames[(new Date(item.time)).getMonth()],
        //          console.log(item.time),
        //
        //          // console.log(monthNames[new Date(item.time).getMonth()]),
        //          data = [
        //              {
        //                  "x": "January",
        //                  "y": 12
        //              },
        //              {
        //                  "x": "February",
        //                  "y": 1
        //              },
        //              {
        //                  "x": "March",
        //                  "y": 13
        //              },
        //              {
        //                  "x": "April",
        //                  "y": 15
        //              },
        //              {
        //                  "x": "May",
        //                  "y": 17
        //              },
        //              {
        //                  "x": "June",
        //                  "y": 19
        //              },
        //              {
        //                  "x": "July",
        //                  "y": 12
        //              },
        //              {
        //                  "x": "September",
        //                  "y": 11
        //              },
        //              {
        //                  "x": "October",
        //                  "y": 1
        //              },
        //              {
        //                  "x": "November",
        //                  "y": 20
        //              },
        //              {
        //                  "x": "December",
        //                  "y": 23
        //              },
        //              ],
        //          // (monthNames[(new Date(item.time)).getMonth()]),
        //
        //          list.push({
        //              "id" : element.title,
        //              "color": "hsl(93, 70%, 50%)",
        //              "data" : data
        //          })
        //      ),
        //
        // );


        //
        // var result = [];
        //
        // all_devices.forEach(element =>
        //     result = _(all_devices)
        //         .groupBy(
        //             element.datas.forEach(item =>
        //                     // x => x.(new Date(item.time).getMonth())
        //                 x => x.monthNames[(new Date(item.time)).getMonth()]
        //             ),
        //         )
        //         .map((y, x) => ({Month: x, Data: y}))
        //         .value()
        //
        // );
        //
        //
        //
        //
        //
        var result2 = _(all_devices)

            // .groupBy(x => x.date1 =new Date(all_devices.datas.length).getMonth() )
            .groupBy(x => x. datas.map(
                    x=>x.time=monthNames[(new Date(x.time)).getMonth()]
                )
            )
            .map((value, key) => ({Month: key, datas: value.time}))
            .value();





        // console.log(result2);
        //
        //
        //
        //
        //

        let listDate = [];
        function dateDisplayed(timestamp) {
            var date = new Date(timestamp);
            return (date.getMonth() + 1 + '/' + date.getDate() + '/' + date.getFullYear());
        }
        all_devices.forEach(element =>

            // console.log((new Date(element.date_published)).getMonth())
        // console.log(monthNames[new Date(element.date_published*1).getMonth()])




        listDate.push(monthNames[(new Date(element.date_published*1)).getMonth()])
        );

        // console.log(listDate)
        console.log(listDate)

        // let datex = (monthNames[(new Date(Devices.date_published)).getMonth()]);

        res.json(lodash.groupBy(all_devices,monthNames[new Date(Devices.date_published*1).getMonth()] ))

        // res.json(result2)




    } catch (err) {
        res.json({message: err.message});
    }
});





// find one by Last
Path.post('/Last_Device', authenticateJWT, async (req, res) => {
    try {
        var last_element;
        all_devices = await Devices.find({author: req.id});


        if (all_devices.length>0) {
            last_element = all_devices[all_devices.length - 1];
        }else {
            console.log("List is all ready empty");
            return res.status(404).send({
                message: "List is all ready empty"
            });

        }

        console.log("Last device",last_element.title);


        res.json(last_element);
    } catch (err) {
        res.json({message: err.message});
    }
});



//find by email
Path.get('/GetByRef/:ref',authenticateJWT,async (req,res) => {
    try {
        const device = await Devices.find ({ref : req.params.ref , author : req.id}) ;
        res.json(device) ;
    } catch (err) {
        res.json({message: err.message})
    }
});




// Favorits


// Update Device ( favorit ) dentified by the Id in the request
Path.put('/UpdateFavoritDevice/:id',authenticateJWT,async (req, res) => {

    au = await Devices.findOne({author : req.id  , _id :req.params.id});
    console.log(au);
    if(!au) {
        return res.status(404).send({
            message: "you can not update it"
        });
    }
    else {
        // Find Device and update it with the request body
        Devices.findByIdAndUpdate(
            req.params.id, {
                favorit:req.body.favorit
            }, {new: true})
            .then(device => {
                if (!device) {
                    return res.status(404).send({
                        message: "Device not found with id " + req.params.id
                    });
                }
                res.send(device);
            }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Device not found with id " + req.params.id
                });
            }
            return res.status(500).send({
                message: "Error updating Device with id " + req.params.id
            });
        });
    }
});


Path.post('/GetFavorit', authenticateJWT, async (req, res) => {
    try {
        all_Favorit = await Devices.find({favorit:true ,author: req.id });
        res.json(all_Favorit);
    } catch (err) {
        res.json({message: err.message});
    }
});




// Update Device ( traking ) dentified by the Id in the request
Path.put('/traking/:id',authenticateJWT,async (req, res) => {

    au = await Devices.findOne({author : req.id  , _id :req.params.id});
    console.log(au);
    if(!au) {
        return res.status(404).send({
            message: "you can not update it"
        });
    }
    else {
        // Find Device and update it with the request body
        Devices.findByIdAndUpdate(
            req.params.id, {
                traking:req.body.traking
            }, {new: true})
            .then(device => {
                if (!device) {
                    return res.status(404).send({
                        message: "Device not found with id " + req.params.id
                    });
                }
                res.send(device);
                console.log("traking ",au.title," is ON ");
            }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "Device not found with id " + req.params.id
                });
            }
            return res.status(500).send({
                message: "Error updating Device with id " + req.params.id
            });
        });
    }
});







// ********************    Add Data -- Kafka   ******************

function hexToDec(hexString){
    return parseInt(hexString, 16);
}

const nexmo = new Nexmo({
    apiKey: 'a15b2232',
    apiSecret: '3WhFrMnn1YgnyJri',
});

function sendEmail(receiver, subject,msg) {
    var result = '';
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'Treetronix2020@gmail.com',
            pass: 'a1z2e3r4t5y6@'
        }
    });
    var mailOptions = {
        from: 'Treetronix2020@gmail.com',
        to: receiver,
        subject: subject,
        text: msg,
        // attachments: [
        //     {
        //         filename: 'yupyou.png',
        //         path: __dirname + '/yupyou.png',
        //         // cid: 'uniq-mailtrap.png'
        //     }
        // ]
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent ');
        }
    });
    return result;
}

function sendTemplateEmail(typemail,receiver, subject,msg ,name,device,location , time ,bettery) {
    var result = '';

    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'Treetronix2020@gmail.com',
            pass: 'a1z2e3r4t5y6@'
        }
    });

    transporter.verify((error, success) => {
        if (error) {
            console.log(error);
        } else {
            console.log('Server is ready to send messages');
        }
    });



    ejs.renderFile( "D:\\ESPRIT\\PFE ESPRIT\\Backend_NodeJs\\config\\Mails\\"+typemail+".ejs",
        { name: name , device: device, location: location, time: time ,bettery: bettery , },
        function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'Treetronix2020@gmail.com',
                    to: receiver,
                    subject: subject,
                    // text: msg,
                    html: data

                };

                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        res.json({
                            msg: 'fail'
                        })
                    } else {
                        res.json({
                            msg: 'success'
                        })
                    }
                });
            }
        });


    return result;
}

var geocoder = NodeGeocoder({
    // provider: 'google',

    provider: 'opencage',
    // Ahmed.yahyaoui.2
    apiKey: 'c3cc880c22714af4ab5aeaa1bcb8150d',

    //Treetronix
    // apiKey: 'f96410f6e09844e29c00f1e269852c55',

    language: 'fr',
});

var location_device_test = "";
var location_device_test2 = "";




            /*     TREETRONIX / GLOBALNET - GETWAY-      */

var kafka_ip = "193.95.76.211:9092";
var kafka_Topic ="AS.Treetronix.v1" ;






            /*    LOCAL - GETWAY    */

// var kafka_ip = "192.168.1.2:9092";

// var kafka_Topic ="treeconsum" ;
// var kafka_Topic ="kafkaconsumertest" ;
// var kafka_Topic ="TestTopicJson" ;


/*
        console.log("Msg Kafka > > > "+y.toString());



        GetGeoCodingLocation(y);
        setTimeout(()=>{
            DecryptAndSendDAATA(y);
            Notification(y);
            FCM_PUSH_NOTIF(y);
        },2000);







                // if (y !== null)
        // {
        //     console.log("Msg Kafka > > > "+y.toString());
        //     GetGeoCodingLocation(y);
        //     setTimeout(()=>{
        //         DecryptAndSendDAATA(y);
        //         Notification(y);
        //         FCM_PUSH_NOTIF(y);
        //     },2000);
        // }
        // else
        // {
        //     console.log("Msg Kafka empty");
        //
        // }

 */


// OLD Kafka ** Node-Kafka

// try {
//     Consumer = kafka.Consumer;
//         client = new kafka.KafkaClient({kafkaHost: kafka_ip});
//         consumer = new Consumer(
//             client,
//             [
//                 {topic: kafka_Topic, partition: 0}
//              ],
//             {autoCommit: true}
//         );
//     consumer.on('message', function (message) {
//
//
//         // console.log(message);
//
//
//
//         var y= JSON.parse(message.value);
//
//         console.log("Msg Kafka > > > "+y.toString());
//
//
//
//         GetGeoCodingLocation(y);
//         setTimeout(()=>{
//             DecryptAndSendDAATA(y);
//             Notification(y);
//             FCM_PUSH_NOTIF(y);
//         },2000);
//
//
//
//
//
//
//         // if (y !== null)
//         // {
//         //     console.log("Msg Kafka > > > "+y.toString());
//         //     GetGeoCodingLocation(y);
//         //     setTimeout(()=>{
//         //         DecryptAndSendDAATA(y);
//         //         Notification(y);
//         //         FCM_PUSH_NOTIF(y);
//         //     },2000);
//         // }
//         // else
//         // {
//         //     console.log("Msg Kafka empty");
//         //
//         // }
//
//         // var y= JSON.parse(message.value);
//         // DecryptAndSendDAATA(y);
//         // Notification(y);
//         // FCM_PUSH_NOTIF(y);
//
//
//     });
//     consumer.on('error', function (err) {
//         console.log('error', err);
//     });
// } catch (e) {
//     console.log(e);
// }








// New Kafka ** no-kafka

var consumer = new NoKafka.SimpleConsumer({
    connectionString: kafka_ip,
    clientId: 'test'
});
var dataHandler = function (messageSet, topic, partition) {
    messageSet.forEach(function (m) {
        // console.log(m.message.value.toString('utf8'));

        const obj = JSON.parse(m.message.value.toString('utf8'));

        // console.log("Msg Kafka > > > " +obj);
        console.log(colors.green("Msg Kafka > > > "));
        GetGeoCodingLocation(obj);
        setTimeout(()=>{
            DecryptAndSendDAATA(obj);
            Notification(obj);
            FCM_PUSH_NOTIF(obj);
        },2000);

        //
        // check(obj) ;
        // console.log(obj) ;

        return io.emit('message', {y: m.message.value.toString('utf8')});
    });
};

consumer.init().then(function () {
    var v1= consumer.subscribe(kafka_Topic, dataHandler);
    var arr=[];
    arr.push([v1]);
    // console.log("val:"+arr);
    return arr;


});








async function DecryptAndSendDAATA(obj) {
    payload = obj.DevEUI_uplink.payload_hex ;
    DevEUI = obj.DevEUI_uplink.DevEUI ;
    time = obj.DevEUI_uplink.Time ;
    adress_device = location_device_test ;

    try {
        device = await Devices.findOne({ref: DevEUI});
        if (device === null) {
            console.log(colors.magenta(DevEUI,'not exist'));
        } else {
            console.log(colors.red(DevEUI ,"  At : ",time));

            var dismantled = hexToDec (payload.substring(0, 2)) ;
            var moving  = hexToDec (payload.substring(2, 4)) ;
            var charging = hexToDec (payload.substring(4, 6));
            var voltage = hexToDec (payload.substring(6, 8))/10;
            var LAT = hexToDec (payload.substring(8, 14))* 90 / 8388607 ;
            var LNG = hexToDec (payload.substring(14, 20))* 180 / 8388607;
            // v = hexToDec (payload.substring(6, 8));
            var batterie = ((hexToDec (payload.substring(6, 8))-30)/12) * 100 ;
            let bettery = parseInt(batterie);

            DeviceValues = {
                "dismantled": +dismantled,
                "moving": +moving,
                "charging": +charging,
                "time": +Date.parse(time),
                "voltage": +voltage,
                "LAT": +LAT,
                "LNG": +LNG,
                "batterie": +bettery,
                "adress_device": location_device_test,
            };

            // console.log(' LAT = '+LAT.toString()+ ' LNG = '+LNG.toString());

            // test if LAT AND LNG = 0
            if (LAT === 0 || LNG ===0 ){
                // console.log('Moving ama Lat wala lng = 0 , DB');
                console.log('Your device , LAT = '+LAT.toString()+ ', LNG = '+LNG.toString() , 'DataBase');

            }else {
                device = await Devices.findOne({ref: DevEUI});
                device.datas.push(DeviceValues);
                await device.save();


                // updateClients_Soket(DeviceValues,device);

            }

        }
    } catch (e) {
        console.log(e);
    }
}

async function Notification(obj) {
    payload = obj.DevEUI_uplink.payload_hex ;
    DevEUI = obj.DevEUI_uplink.DevEUI ;
    time = obj.DevEUI_uplink.Time ;


    try {
        device = await Devices.findOne({ref: DevEUI});
        // device = await Devices.findOne({ref: DevEUI , traking:true });
        trak = await Devices.findOne({ref: DevEUI , traking: true});

        device_owner = await Devices.findOne({ref: DevEUI , favorit:true });
        // userr = await User.findOne({_id : device.author._id});
        // userr = await User.findOne({_id: device_owner.author._id});

        // var bettery = (((hexToDec(payload.substring(6, 8)) - 30) / 12) * 100).toFixed(2);






        if (device === null)
        {
            // console.log(DevEUI,'not exist');
        }
        else {

            if(device_owner !== null){
                userr = await User.findOne({_id: device_owner.author._id});
                var moving = hexToDec(payload.substring(2, 4));
                var bettery = ((hexToDec(payload.substring(6, 8)) - 30) / 12) * 100;
                let betterie = parseInt(bettery);
                var charging = hexToDec(payload.substring(4, 6));
                var LAT = hexToDec (payload.substring(8, 14))* 90 / 8388607 ;
                var LNG = hexToDec (payload.substring(14, 20))* 180 / 8388607;


                if(userr)
                {


                    // Batterie
                    if (betterie < 15) {
                        subject_mail = ' Battery level From ' + device_owner.title;
                        text_mail =
                            'Hello , ' + userr.username + '\n' + '\n'
                            + 'The battery level of ' + device_owner.title + ' is: ' + (((hexToDec(payload.substring(6, 8)) - 30) / 12) * 100).toFixed(2) + '%\n'
                            + 'At ' + dateFormat(time, "dddd, mmmm dS, yyyy, h:MM:ss");


                        // sendEmail(to_mail, subject_mail, text_mail);

                        sendTemplateEmail("BetteryMail",to_mail,subject_mail,text_mail
                            ,userr.username,device_owner.title,location_device_test
                            ,dateFormat(time, "dddd, mmmm dS, yyyy, h:MM:ss"),
                            (((hexToDec(payload.substring(6, 8)) - 30) / 12) * 100).toFixed(2)
                        )

                    }


                    // Batterie et car
                    if (device_owner.category === 'car' && charging === 0) {
                        to_mail = userr.email;

                        subject_mail = ' Battery level From device :' + device_owner.title;
                        text_mail =
                            'Hello , ' + userr.username + '\n' + '\n'
                            + 'Your device "' + device_owner.title + '," which connected to your vehicle has been stoped \n'
                            + 'At ' + dateFormat(time, "dddd, mmmm dS, yyyy, h:MM:ss");

                        sendEmail(to_mail, subject_mail, text_mail);
                    }


                    // notif MAIL trakcing
                    to_mail=userr.email;

                    if (trak !== null && moving === 1)
                    {
                        if (LAT === 0 || LNG ===0 ){
                            console.log(' Moving ama Lat wala lng = 0 , mail ');
                        }else{

                            subject_mail=' Notification From '+ device.title;
                            text_mail=
                                'Hello , '+ userr.username +'\n'+'\n'
                                +'Your device : '+device.title+' is moving right now .'+'\n'
                                // +'His location now : '+res[0].toString() +'\n'
                                +'His location now : '+location_device_test +'\n'
                                +' (Exactly at '+dateFormat(time, "dddd, mmmm dS, h:MM:ss")+' )'+'\n'+'\n'
                                +'The battery level of your device is: '+betterie+'%';

                            // sendEmail( to_mail , subject_mail , text_mail);

                            sendTemplateEmail("movingMail",to_mail,subject_mail,text_mail
                                ,userr.username,device.title,location_device_test
                                ,dateFormat(time, "dddd, mmmm dS, h:MM:ss"),
                                betterie
                            );

                            // notif SMS
                            text = 'Hello '+ userr.username +',\n'+device.title+ ' is moving '+dateFormat(time, "mmmm dS, h:MM:ss")+'\n for more informations open YupYou App .';
                            from = 'TreeTroniX';
                            to = '216'+userr.numTel;

                            // nexmo.message.sendSms(from, to, text);
                        }






                    } else{
                        console.log(DevEUI,' Moving = '+moving.toString()+' , Tracking = ',trak ,' , Mail');
                    }
                }
            }
        }

    } catch (e) {
        console.log(e);
    }
}

async function GetGeoCodingLocation (obj){
    payload = obj.DevEUI_uplink.payload_hex ;
    DevEUI = obj.DevEUI_uplink.DevEUI ;

    var LAT = hexToDec (payload.substring(8, 14))* 90 / 8388607 ;
    var LNG = hexToDec (payload.substring(14, 20))* 180 / 8388607;

    // var config = {
    //     'key':'c3cc880c22714af4ab5aeaa1bcb8150d',
    //     'latitude': LAT,
    //     'longitude': LNG
    // };
    // geocoding(config, function (err, data){
    //     if(err){
    //         console.log(" geocoding err: " +err);
    //     }else{
    //         console.log(" geocoding : " +data);
    //     }
    // });
    device = await Devices.findOne({ref: DevEUI});

    if (device !== null) {


        // // Using callback
        // console.log(' LAT = '+LAT.toString()+ ' LNG = '+LNG.toString());
        // geocoder.geocode(''+LAT+','+ LNG+'', function(err, res) {
        //     console.log('res : ' + res);
        // });



        // Or using Promise
        // geocoder.geocode('37.4396, -122.1864')
        //     .then(function(res) {
        //         console.log('res : ' +res);
        //     })
        //     .catch(function(err) {
        //         console.log('res err: ' +err);
        //     });



        // opencage.geocode({q: '37.4396, -122.1864', language: 'fr'}).then(data => {
        //     // console.log(JSON.stringify(data));
        //     if (data.status.code == 200) {
        //         if (data.results.length > 0) {
        //             var place = data.results[0];
        //             console.log(place.formatted);
        //             console.log(place.components.road);
        //             console.log(place.annotations.timezone.name);
        //         }
        //     } else if (data.status.code == 402) {
        //         console.log('hit free trial daily limit');
        //         console.log('become a customer: https://opencagedata.com/pricing');
        //     } else {
        //         // other possible response codes:
        //         // https://opencagedata.com/api#codes
        //         console.log('error', data.status.message);
        //     }
        // }).catch(error => {
        //     console.log('error', error.message);
        // });



        if(LAT !==0 && LNG !== 0)
        {
            const res = await geocoder.reverse({
                lat: LAT,lon: LNG, language: 'fr'
            });

            console.log(' res = ' + res);


            try {
                location_device_test = res[0].streetName +' '+res[0].state+' ' + res[0].zipcode ;

            }catch (e) {
                console.log(res[0]);
            }
        }else {
            console.log(" GetGeoCodingLocation : LAT = " +LAT.toString() +" LNG = "+LNG.toString() );
        }

    }




}


const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};

async function FCM_PUSH_NOTIF(obj) {
    payload = obj.DevEUI_uplink.payload_hex ;
    DevEUI = obj.DevEUI_uplink.DevEUI ;
    time = obj.DevEUI_uplink.Time ;


    try {
        device = await Devices.findOne({ref: DevEUI});
        // device = await Devices.findOne({ref: DevEUI , traking:true });
        trak = await Devices.findOne({ref: DevEUI , traking: true});
        device_owner = await Devices.findOne({ref: DevEUI});
        // userr = await User.findOne({_id : device.author._id});

        var bettery = ((hexToDec(payload.substring(6, 8)) - 30) / 12) * 100;
        let betterie = parseInt(bettery);
        var charging = hexToDec(payload.substring(4, 6));



        if (device === null)
        {
            // console.log(DevEUI,'not exist');
        }
        else {
            userr = await User.findOne({_id: device_owner.author._id});
            var LAT = hexToDec (payload.substring(8, 14))* 90 / 8388607 ;
            var LNG = hexToDec (payload.substring(14, 20))* 180 / 8388607;
            var moving = hexToDec(payload.substring(2, 4));

            if(userr)
            {
                // notif FCM
                // to_mail=userr.email;

                // console.log('moving = '+moving);
                // console.log('trak = '+trak);

                if (trak !== null && moving === 1)
                {
                    // if (LAT === 0 || LNG ===0 ){
                    //     console.log('Moving ama Lat wala lng = 0 , notif');
                    // }else{}

                    var registrationToken =userr.fcm_token ;
                        // var registrationToken ="eCItL-ooeEyz2v3GqyQdoi:APA91bH_0TUEtSWAb5fbN502_erngWvzBAkD0O4GumgHyymjOYJ8sPVkJsK1dKHByJ_rNI8Yv7n9oLuNZhQ12O-SP1bajZazBzha3DsKbzfvtHm1mUHG95xII_dn2roMt_y_Ea7RWdxi" ;
                        const payload = {
                            notification: {
                                title: 'Notification From ' +device.title,
                                body:
                                    'Hello '+ userr.username
                                    +', '+device.title+' is moving right now .'+'\n'
                                    +'Device location : '+location_device_test +'\n'
                                    +'At '+dateFormat(time, "dddd, mmmm dS, h:MM:ss"),
                            },
                            token: registrationToken
                        };
                        var defaultMessaging = adminss.messaging();
                        defaultMessaging.send(payload)
                            .then((response) => {
                                // Response is a message ID string.
                                console.log('Successfully sent message:', response);
                            })
                            .catch((error) => {
                                console.log('Error sending message:', error);
                            });


                } else{
                    console.log(DevEUI,' Moving =  '+moving+' , Notification');
                }
            }
        }
    } catch (e) {
        console.log(e);
    }
}

































/*
*      **************** FOR TEST ********************
*/











/*
*      ******** TEST PUSH NOTIF *******
*/

Path.post('/firebase/notification', ()=>{

    const optionsl =  notification_options;
    // var registrationToken = 'fud4hHdTCY4:APA91bFTtlXL-m3tT-2rPSVQMMMLcW3dqZt_pDNskvkXDRluHVpJpNT2htQrd2IoYhk-LyT5L7l5f9dWak5FO-H_vD30fFqWQe5TQwkOVDYgffiWcpl8JbY-enRR5pNf3sYFTgpxhUbl';
    var registrationToken =
'dVEflOrsSrC1pqgw4lbnHp:APA91bFtuBpq92Vx7TsZ8UicgA1NjOWSTurzYFCVAiYowaEi5h_64lO-El5YFeyqGyPpsLms1sZMfjQz35A2P7k60VJ-pcrIzQYr_Sdt8f1B5rhq9kiB5VX_AiZZvuyj7cQ6G9mCPKpM';
    const payload = {
        notification: {
            title: 'Notification Title',
            body: 'haamdl aalik LumputsFace',
        },
        token: registrationToken
    };

    var defaultMessaging = adminss.messaging();
    // var defaultMessagings = firebase.admin.messaging();


    defaultMessaging.send(payload)
        .then((response) => {
            // Response is a message ID string.
            console.log('Successfully sent message:', response);
        })
        .catch((error) => {
            console.log('Error sending message:', error);
        });

});



/*





var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'Treetronix2020@gmail.com',
        pass: 'a1z2e3r4t5y6@'
    }
});

transporter.verify((error, success) => {
    if (error) {
        console.log(error);
    } else {
        console.log('Server is ready to send messages');
    }
});



Path.post('/send', (req, res, next) => {

    var name = 'Ahmed'
    var email = 'ahmed.yahyaoui.2@esprit.tn'
    var device = 'Lumputs'
    var bettery = '60%'
    var location = 'hne wala ghady kif kif '
    var time = '12 / 02 / 2020 20:30'

    const ejs = require("ejs");

    ejs.renderFile( "D:\\ESPRIT\\PFE ESPRIT\\Backend_NodeJs\\config\\Mails\\movingMail.ejs",
        { name: name , email :email , device: device, location: location, time: time ,bettery: bettery , },
        function (err, data) {
            if (err) {
                console.log(err);
            } else {
                var mainOptions = {
                    from: 'Treetronix2020@gmail.com',
                    to: email,
                    subject: 'Account Activated',
                    html: data
                };

                transporter.sendMail(mainOptions, function (err, info) {
                    if (err) {
                        res.json({
                            msg: 'fail'
                        })
                    } else {
                        res.json({
                            msg: 'success'
                        })
                    }
                });
            }
        });

})





*/


// find all by user
Path.post('/All_device', async (req, res) => {
    try {
        all_devices = await Devices.find();
        console.log(" Device Lkol papicha ");


        all_devices.forEach(element =>
            element.datas.reverse()
        );

        console.log(all_devices);


        res.json(all_devices);
    } catch (err) {
        res.json({message: err.message});
    }
});




module.exports = Path;