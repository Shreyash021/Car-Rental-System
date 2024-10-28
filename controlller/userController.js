 

const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const nodemailer = require("nodemailer");

const randomstring = require('randomstring');

const config = require('../config/config');

const loadRegister = async (req , res) =>{

    try{

        res.render("registration");

    }catch(error){
        console.log("error");
    }

}



//secure password

const securePassword = async (password) =>{
    try{

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    }catch(err){
        console.log(err.message);
    }
}


//for send mail to user
const sendVerifyMail = async(name , email , user_id) =>{
    try{
        const transPorter = nodemailer.createTransport({
            host : 'smtp.gmail.com', 
            port : 587,
            secure : false,
            requireTLS : true,
            auth : {
                user :  config.emailUser,        //user : "kedarnath.22110698@viit.ac.in",
                pass : config.emailPassword     //pass : 'levnlyowohzxbode',
            }
        });

        const mailOptions = {
            from : 'kedarnath.22110698@viit.ac.in',
            to : email,
            subject : 'For Verification mail',
            html : '<p>Hii '+name+', Please click here to <a href="http://localhost:8080/verify?id='+user_id+'"> Verify </a> your mail. </p>',
        }

        transPorter.sendMail(mailOptions , function(error , info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent:- ", info.response);
            }
        })
    }
    catch(error){
        console.log(error);
    }
}

//for forget password send me
const sendResetPasswordMail = async(name , email , token) =>{
    try{
        const transPorter = nodemailer.createTransport({
            host : 'smtp.gmail.com', 
            port : 587,
            secure : false,
            requireTLS : true,
            auth : {
                user :  config.emailUser,        //user : "kedarnath.22110698@viit.ac.in",
                pass : config.emailPassword     //pass : 'levnlyowohzxbode',
            }
        });

        const mailOptions = {
            from : 'kedarnath.22110698@viit.ac.in',
            to : email,
            subject : 'For Reset Password',
            html : '<p>Hii '+name+', Please click here to <a href="http://localhost:8080/forget-password?token='+token+'"> Reset your Password </a> your mail. </p>',
        }

        transPorter.sendMail(mailOptions , function(error , info){
            if(error){
                console.log(error);
            }
            else{
                console.log("Email has been sent:- ", info.response);
            }
        })
    }
    catch(error){
        console.log("error");
    }
}


const insertUser = async (req, res) =>{

    try{

        const sucurePassword = await securePassword(req.body.password);

        const user = new User({
            name : req.body.name,
            email : req.body.email,
            mobile : req.body.mno,
            image : req.file.filename ,
            password : sucurePassword,
            is_admin : 0
        })

        const userData = await user.save();

        if(userData){

            sendVerifyMail(req.body.name , req.body.email , userData._id);

            res.render('registration' , {message : "successfull, verify your mail." })
        }
        else{
            res.render('registration' , {message : "Your registration has been failed!" })
        }

    }catch(error){
        res.render("404", {message : error.message});
        console.log("404");
    }

}

const verifyMail = async(req,res)=>{
    try{

        const updateInfo = await User.updateOne({_id:req.query.id},{$set : { is_varified : 1 } });         //make unverified to verified

        console.log(updateInfo);
        res.render("email-verified");

    }
    catch(error){
        console.log(error.message);
    }
}


//Login process Start Here

const loginLoad = async (req, res) =>{
    try{

        res.render("login");

    }
    catch(error){
        console.log("error plese Log Out");
    }
}

const verifyLogin = async (req, res) =>{ 
    try{ 
        const email = req.body.email;
        const password = req.body.password; 
        const userData = await User.findOne({email : email}); 
        if(userData){ 
            const passwordMatch = await bcrypt.compare(password , userData.password); 
            if(passwordMatch){ 
                if(userData.is_varified === 0)
                    res.render("login", {message : "Please varify your mail"})  
                else{
                    req.session.user_id = userData._id;
                    res.redirect("/home");
                } 
            }
            else {
                res.render("login", {message : "Email and password is incorrect" }); 
            }
        }
        else {
            res.render("login",{message : "Email and password is incorrect"}); 
        } 
    } catch(error){ console.log(error); }
}


//Load Home Page
const loadHome = async(req, res) =>{
    try{
        const userData = await User.findById({_id:req.session.user_id});

        res.render("home" , {user : userData });                                    //Username save in HTML
    }
    catch(error){ 
        console.log('404 Login karrro');
    }
}


//User Logout
const userLogout = async(req, res) =>{
    try{
        req.session.destroy();
        res.redirect("/");
    }
    catch(error){
        console.log("Do login");
    }
}


//Forget Password code start
const forgetLoad = async (req, res) => {

    try{
        res.render('forget')
    }
    catch(error){
        console.log(error);
    }

}


//Send email to reset...
const forgetVerify = async(req, res) => {
    try{

        const email = req.body.email;
        const userData = await User.findOne({email:email});
        if(userData){
            
            if(userData.is_varified === 0){
                res.render('forget', {message : "plese verify your mail..."});
            }
            else{   //Able to receive reset mail
                const randomString = randomstring.generate(); 
                // console.log(randomString);
                const updateData = await User.updateOne({email:email}, { $set : {token : randomString} } );                     //Save the token in database
                sendResetPasswordMail(userData.name, userData.email,randomString);
                res.render('forget',{message : "Plese ckeck your mail to reset password..."})
            }
        }
        else{
            res.render('forget', {message : "User email is incorrect..."});
        }

    }
    catch(error){
        console.log(error);
    }
}

// render after Reset mail

const forgetPasswordLoad = async(req, res) => {

    try{

        const token = req.query.token;
        const tokenData = await User.findOne({token:token});
        // console.log(token);
        // console.log(tokenData);

        if(tokenData){
            res.render('forget-password', {user_id : tokenData._id})
        }
        else{
            res.render('404', {message : "Page not found/Token is not valid"});
        }

    }
    catch(error){
        console.log(error);
    }

}
 

//Post the data after reset the password

const resetPassword = async(req, res) => {
    try{

        const password = req.body.password;
        const user_id = req.body.user_id;
        
        const secure_password =await securePassword(password);             //hash password

        const ipdatedData = await User.findByIdAndUpdate({_id:user_id},{$set : {password:secure_password , token:''}});

        res.redirect('/');   //login

    }
    catch(error){
        console.log("ERROR AT the time of reset password");
    }
}


//Vrrification Mail

const verificationLoad = async(req,res) =>{
    try{
        res.render('verification');
    }
    catch(error){
        console.log("nvgvgh");
    }
}

//post

const sendVerificationLink = async(req,res) =>{
    try{
        const email = req.body.email;
        const userData = await User.findOne({email : email}); 
        // const userData = await User.findOne({email:eamil});
        if(userData){
            // sendVerifyMail(userData.name, userData.email, userData.user_id);
            sendVerifyMail(req.body.name , req.body.email , userData._id);

            res.render('verification',{message:"Reset verification mail sent on your mail plese check!!!"})
        }
        else{
            res.render('verification',{message : "This email is not exist!!!"});
        }
    }
    catch(error){
        console.log(error);
    }

}



// _________________________________________________________________________________________________________________

//Use Update/Edit
const editLoad = async(req,res)=>{
    try{
        const id = req.query.id;

        const userData = await User.findById({_id:id});

        if(userData){
            res.render('edit',{user:userData});
        }
        else{    
            res.redirect('/home');
        }
    }
    catch(error){
        console.log(error);
    }
}

//Post Updeted profile
const updateProfile = async(req,res)=>{
    try{

        console.log(req.body.name);
        if(req.file){                //When Update Image
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id} , {$set : {name:req.body.name , email:req.body.email , mobile:req.body.mno , image:req.file.filename}} );
        }
        else{                      //Update without Image
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id} , {$set : {name:req.body.name , email:req.body.email , mobile:req.body.mno}} );
        }

        res.redirect('/home');

    }
    catch(error){
        console.log(error);
    }
}

//first
const indexLoad = async(req,res)=>{
    try{

        res.render('index');

    }
    catch(error){
        console.log("error");
    }
}

// /about
const LoadAbout = async(req,res)=>{
    try{

        res.render('about');

    }
    catch(error){
        console.log("error");
    }
}

// /about
const LoadAboutPage = async(req,res)=>{
    try{

        res.render('aboutpage');

    }
    catch(error){
        console.log("error");
    }
}


 

//Use Update/Edit
const loadAddCar = async(req,res)=>{
    try{
        const id = req.query.id;

        const userData = await User.findById({_id:id});

        if(userData){
            res.render('addcar',{user:userData});
        }
        else{    
            res.redirect('/home');
        }
    }
    catch(error){
        console.log(error.message);
    }
}

//Post Updeted profile
const addCar = async(req,res)=>{
    try{

        console.log(req.body.name); 
        if(req.file){                //When Update Image
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id} , {$set : {name:req.body.name , email:req.body.email , mobile:req.body.mno , image:req.file.filename}} );
        }
        else{                      //Update without Image
            const userData = await User.findByIdAndUpdate({_id:req.body.user_id} , {$set : {carname:req.body.carname , price:req.body.price  }} );
        }

        res.redirect('/home');

    }
    catch(error){
        console.log(error.message);
    }
}

module.exports = {
    loadRegister,
    insertUser,
    verifyMail,
    loginLoad,
    verifyLogin,
    loadHome,
    userLogout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    verificationLoad,
    sendVerificationLink,
    editLoad,
    updateProfile,
    indexLoad,
    LoadAbout,
    LoadAboutPage,
    loadAddCar,
    addCar

}