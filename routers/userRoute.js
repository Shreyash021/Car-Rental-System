


const express = require("express"); 
const user_rout = express();     //  user_rout = app();

const session = require("express-session");
const config = require('../config/config');
user_rout.use(session({secret : config.sessionSecret }));

const auth = require("../middleware/auth");

user_rout.set("view engine" , "ejs");
user_rout.set('views' , './views/users');

const bodyParser = require("body-parser");
user_rout.use(bodyParser.json());
user_rout.use(bodyParser.urlencoded({extended : true}));

user_rout.use(express.static('public'));                         //use static file ex.Show images

const multer = require("multer");                               //Upload Images
const path = require("path");


const storage = multer.diskStorage({
    destination : function(req , file , cb){
        cb(null, path.join(__dirname, '../public/userimages'));
    },
    filename : function(req , file , cb){
        const name = Date.now()+'-'+file.originalname;
        cb(null,name);
    }
})
const upload = multer({storage : storage});

const userController = require('../controlller/userController');

//First
user_rout.get('/' , userController.indexLoad);
 
//Registration
user_rout.get('/register' , auth.isLogout , userController.loadRegister);                       //(req,res) defined in userController filr=e

//Registration---> Upload image in database
user_rout.post('/register', upload.single('image') ,userController.insertUser);

//Verification Reg
user_rout.get('/verify' , userController.verifyMail);

//Login---> get data from user
user_rout.get('/login' , auth.isLogout, userController.loginLoad);
user_rout.get('/login' , auth.isLogout, userController.loginLoad);

//login---> pass data in database
user_rout.post('/login' , userController.verifyLogin);

//Home loading
user_rout.get('/home' , auth.isLogin , userController.loadHome);

//Logout
user_rout.get('/logout' , auth.isLogin , userController.userLogout);

//forget password
user_rout.get('/forget' , auth.isLogout, userController.forgetLoad);

//send email to reset
user_rout.post('/forget', userController.forgetVerify);

//page render after reset mail
user_rout.get('/forget-password', auth.isLogout,userController.forgetPasswordLoad);

//Post after Reset form
user_rout.post('/forget-password',  userController.resetPassword);

//Send Registration ver
user_rout.get('/verification', userController.verificationLoad);

//post
user_rout.post('/verification',userController.sendVerificationLink);


// """""""""""""Updatw Uswe"""""""""""""""""""""

//Set Rout to edit user_Data
user_rout.get('/edit', auth.isLogin,userController.editLoad);

//Post Edited Details
user_rout.post('/edit', upload.single('image') , userController.updateProfile);


//about page
user_rout.get('/about',userController.LoadAbout);

//aboutpage
user_rout.get('/aboutpage',userController.LoadAboutPage);


// *****************************************************************************************************
user_rout.get('/addcar', auth.isLogin ,userController.loadAddCar); 
user_rout.post('/addcar', upload.single('image') , userController.addCar);

 



module.exports = user_rout;