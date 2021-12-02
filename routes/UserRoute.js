// GET route for reading data
const express = require('express');
var bodyParser = require('body-parser');

const Path =express.Router();
const User  = require('../models/User');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');
// const multer = require('multer');
// const upload = multer();

const ejs = require("ejs");



Path.use(bodyParser.json());
Path.use(bodyParser.urlencoded());
Path.use(bodyParser.urlencoded({ extended: true }));


const authenticateJWT = (req, res, next) => {
    let payload;
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1];
        try {
            payload = jwt.verify(token, 'tokenCript');
        } catch (e) {
            return res.status(400).send('Invalid User');
        }
        decoded = jwt.decode(token, {complete: true});
        req.id = decoded.payload.id;
        next()
    } else {
        res.sendStatus(401);
    }
};


//,upload.none()


// Login
Path.post('/login',async (req, res) =>
{
    try{
        const  NewUser=await User.find({ email : req.body.email  }).limit(1);
        console.log(NewUser.length);
        if (NewUser.length < 1)
        {
            await res.status(400).json({message: 'Email Does not Exists'});
            return console.log("Email Does not Exists log");

        }
        if (NewUser[0].password !== req.body.password )
        {
            await res.status(400).json({message: 'Wrong Password'});
            return console.log("Wrong Password log ");
        }
        if (NewUser[0].enabled === 0 )
        {
            await res.status(400).json({message: 'User is Disabled'});
            return console.log("User is Disabled log ");
        }
        var payload = {
            id: NewUser[0]._id,
        };
        let token = jwt.sign(payload,'tokenCript');
        // res.json({status:"ok" , message: 'Welcome Back', UserData : NewUser , token});
        res.json({User: NewUser[0]._id , token});
        // res.json({token});
        console.log("Done");
    }catch (err) {
        res.json({ message:err.message });
    }

});



// register
Path.post('/register',async (req,res) =>
{
    console.log(req.body);
    let user=new User({
        username : req.body.username,
        email :req.body.email,
        password :req.body.password,
        password2 :req.body.password2,
        numTel :req.body.numTel ,
        is_active: true ,
        date_joined : Date.now(),
    });
    try{
        const NewUser =await User.find({ email : req.body.email , username : req.body.username });
        if (NewUser === undefined || NewUser.length === 0 )
        {

            // user=await user.save();
            await user.save();
            sendTemplateEmail("welcomeMail",user.email,"Welcome to Yepyou ","msg",user.username);

            res.json({status:"ok" , message: 'Account Create ! You can now Login'});

            return ;

        }

        res.json({status:"err" , message: 'Email Already Exists'});
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }

});


// password change request
Path.post('/request',async (req,res) => {
    try {
        const NewUser = await User.find({ email : req.body.email  });

        console.log(NewUser);
        if (NewUser.length < 1)
        {
            await res.json({status: "err", message: 'Email Does not Exists'});
        }
        else {
            NewUser.save() ;
            console.log('hedha new user bel code' , NewUser) ;
            var transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'iottreetronixt@gmail.com',
                    pass: 'IOT26116986'
                }
            });

            var mailOptions = {
                from: 'iottreetronixt@gmail.com',
                to: req.body.email,
                subject: "bras omek ekteb code",
            };

            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });
        }
    } catch (err) {
        res.json({ status: "ok",message: err})

    }

});


Path.post('/logout', (req, res) => {
    const { token } = req.body;
    refreshTokens = refreshTokens.filter(token => t !== token);

    res.send("Logout successful");
});


//logout user
Path.get('/logout2',authenticateJWT,function(req,res){
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
        res.send("Logout successful");

    });

});


// Profile
Path.post('/Profile', authenticateJWT, async (req, res) => {
    try {

        const UserProfile = await User.findOne({_id: req.id});
        res.json(UserProfile);
        console.log(UserProfile._id);
    } catch (err) {
        // res.header("Access-Control-Allow-Headers", "*");
        res.json({status: 'err', message: err.message});
    }
});




















// Update Device dentified by the Id in the request
Path.put('/UpdateUser',authenticateJWT,async (req, res) => {
    au = await User.findOne({_id : req.id});
    console.log('User howaa :: '+ au);
    if(!au) {
        console.log('tnajemech tba3bes ');
        return res.status(404).send({
            message: "you can not update it"
        });
    }
    else {
        console.log('hetha enty si lkhra tnajem tba3bes ');
        // Validate Request title
        if (!req.body.username) {
            return res.status(400).send({
                message: "User username can not be empty"
            });
        }
        // Validate Request ref
        if (!req.body.email) {
            return res.status(400).send({
                message: "User email can not be empty"
            });
        }
        // Validate Request category
        if (!req.body.numTel) {
            return res.status(400).send({
                message: "User numTel can not be empty"
            });
        }
        // Find Device and update it with the request body
        User.findByIdAndUpdate(
            req.id, {
                username: req.body.username || "Untitled User",
                email: req.body.email || " Unmailed User",
                numTel: req.body.numTel
            }, {new: true})
            .then(device => {
                if (!device) {
                    return res.status(404).send({
                        message: "User not found with id " + req.id
                    });
                }
                res.send(device);
            }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with id " + req.id
                });
            }
            return res.status(500).send({
                message: "Error updating User with id " + req.id +' : '+ err
            });
        });
    }

});





// Update Device dentified by the Id in the request
Path.put('/UpdatePassword',authenticateJWT,async (req, res) => {
    au = await User.findOne({_id : req.id});
    console.log('User howaa :: '+ au);
    console.log('Password User howaa :: '+ au.password);

    if(!au) {
        console.log('hetha mech enty si lkhra tnajemech tba3bes ');
        return res.status(404).send({
            message: "you can not update it"
        });
    }
    else {
        console.log('hetha enty si lkhra tnajem tba3bes ');
        // Validate Request title
        if (!req.body.password) {
            return res.status(400).send({
                message: "User password can not be empty"
            });
        }

        // Find Device and update it with the request body
        User.findByIdAndUpdate(
            req.id, {
                password: req.body.password
            }, {new: true})
            .then(device => {
                if (!device) {
                    return res.status(404).send({
                        message: "User not found with id " + req.id
                    });
                }
                res.send(device);
            }).catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found with id " + req.id
                });
            }
            return res.status(500).send({
                message: "Error updating User with id " + req.id +' : '+ err
            });
        });
    }

});




// Login
Path.post('/login2',async (req, res) =>
{
    try{
        const  NewUser=await User.find({ email : req.body.email  }).limit(1);
        console.log(NewUser.length);
        if (NewUser.length < 1)
        {
            await res.status(400).json({message: 'Email Does not Exists'});
            return console.log("Email Does not Exists log");

        }
        if (NewUser[0].password !== req.body.password )
        {
            await res.status(400).json({message: 'Wrong Password'});
            return console.log("Wrong Password log ");
        }
        if (NewUser[0].enabled === 0 )
        {
            await res.status(400).json({message: 'User is Disabled'});
            return console.log("User is Disabled log ");
        }
        var payload = {
            id: NewUser[0]._id,
        };
        let token = jwt.sign(payload,'tokenCript');
        // res.json({status:"ok" , message: 'Welcome Back', UserData : NewUser , token});
        // res.json({User: NewUser[0].username , token});
        res.json({token});
        console.log("Done");
    }catch (err) {
        res.json({ message:err.message });
    }

});



// register
Path.post('/register2',async (req,res) =>
{
    console.log(req.body);
    let user=new User({
        username : req.body.username,
        email :req.body.email,
        password :req.body.password,
        password2 :req.body.password2,
        numTel :req.body.numTel ,
        is_active: true ,
        date_joined : Date.now(),
        fcm_token : "",
    });
    try{
        const NewUser =await User.find({ email : req.body.email });
        if (NewUser === undefined || NewUser.length === 0 )
        {
            user=await user.save();
            res.json({status:"ok" , message: 'Account Create ! You can now Login'});
            return ;
        }

        res.json({status:"err" , message: 'Email Already Exists'});
    }catch (err) {
        res.header("Access-Control-Allow-Headers", "*");
        res.json({ message:err.message });
    }

});


Path.put('/UpdateUserFCM/:id',async (req, res) => {

    au = await User.findOne({ _id :req.params.id});
    // console.log(au);
    if(!au) {
        return res.status(404).send({
            message: "you can not update it"
        });
    }
    else {
        // Find Device and update it with the request body
        User.findByIdAndUpdate(
            req.params.id, {
                fcm_token:req.body.fcm_token
            }, {new: true})
            .then(user => {
                if (!user) {
                    return res.status(404).send({
                        message: "User not found with id " + req.params.id
                    });
                }
                // console.log("user FCM updated");
                // console.log(fcm_token);
                res.send(user);
                console.log("useer  ",au.username," is ON ");

            })
            .catch(err => {
            if (err.kind === 'ObjectId') {
                return res.status(404).send({
                    message: "User not found 2 with id " + req.body.id
                });
            }
            return res.status(500).send({
                message: "Error updating User with id " + req.params.id
            });
        });
    }
});



async function sendTemplateEmail(typemail,receiver, subject,msg ,name) {
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
        { name: name },
        function (err, data) {
            if (err) {
                console.log("Error henéé y frere",err);
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
                        // res.json({
                        //     msg: 'fail'
                        // })
                        console.log('fail')
                    } else {
                        // res.json({
                        //     msg: 'success'
                        // })
                        console.log('success')

                    }
                });
            }
        });


    return result;
}



module.exports=Path;
