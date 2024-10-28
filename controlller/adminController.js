

const User = require('../models/userModel');
const bcrypt = require('bcrypt');

const nodemailer = require("nodemailer");

const randomstring = require('randomstring');
const config = require('../config/config');


//secure password

const securePassword = async (password) =>{
    try{

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    }catch(err){
        console.log(err.message);
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
            html : '<p>Hii '+name+', Please click here to <a href="http://localhost:8080/admin/forget-password?token='+token+'"> Reset your Password </a> your mail. </p>',
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



const loadLogin = async(req,res) => {
    try{

        res.render('login');

    }
    catch(error){
        console.log(error);
    }
}

//
const verfyLogin = async(req,res)=>{
    try{

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});
        if(userData){

            const passwordMatch = await bcrypt.compare(password,userData.password);                                 //password,bcrypt.hashpass

            if(passwordMatch){

                if(userData.is_admin === 0){
                    res.render('login', {message : "Please verify your mail...."})
                }
                else{
                    req.session.user_id = userData._id;
                    res.redirect("/admin/home");
                }

            }
            else{
                res.render('login', {message : "Email and Password incorrect...."})
            }

        }
        else{
            res.render('login', {message : "Email and Password incorrect...."})
        }

    }
    catch(error){
        console.log(error.message);
    }
}

//
const loadDashboard = async(req,res)=>{
    try{  
        const userData = await User.find({is_admin : 0}); 

        const AdminData = await User.findById({_id : req.session.user_id});
        res.render('home' , {users : userData, admin : AdminData});
    }
    catch(error){
        console.log(error);
    }
}


// /logout
const logout = async(req,res) =>{
    try{
        req.session.destroy();
        res.redirect('/admin');
    }
    catch(error){
        console.log(error);
    }
}

//Logic to forget password
const forgetLoad = async(req,res)=>{
    try{
        res.render('forget');
    }
    catch(error){
        console.log(error);
    }
}

//Post 
const forgetVerify = async(req,res)=>{
    try{

        const email = req.body.email;
        const userData = await User.findOne({email:email});

        if(userData){
            if(userData.is_admin == 0){
                res.render('forget', {message : "Email is incorrect"});
            }
            else{        //Now Ok it`s Admin

                const randomString = randomstring.generate();
                const updateData = await User.updateOne({email:email}, {$set : {token : randomString}});

                sendResetPasswordMail(userData.name , userData.email , randomString);

                res.render('forget', {message : "Plese check Your mail to reset password"})

            }
        }
        else{
            res.render('forget', {message : "Email is incorrect"});
        }

    }
    catch(error){
        console.log(error);
    }
}


//f-p
const forgetPasswordLoad = async(req,res)=>{
    try{

        const token = req.query.token;

        const tokenData = await User.findOne({token : token});

        if(tokenData){

            res.render('forget-password',{user_id : tokenData._id});

        }
        else{
            res.render('404', {message : "Invalid Link"});
        }

    }
    catch(error){
        console.log("error");
    }
}

//post f-p
const resetPassword = async(req,res)=>{
    try{

        const password = req.body.password;
        const user_id = req.body.user_id; 

        console.log(password);

        const securePass = await securePassword(password);

        const updateData = await User.findByIdAndUpdate({_id : user_id}, {$set : {password : securePass , token : ''}});

        res.redirect('/admin');

    }
    catch(error){
        console.log(error.message);
    }
}

//
const adminDashboard = async(req,res)=>{
    try{
        const AdminData = await User.findById({_id : req.session.user_id});
        // res.render('home' , {admin : userData});
        const userData = await User.find({is_admin : 0});
        res.render('dashboard' , {users : userData, admin : AdminData});
    }
    catch(error){
        console.log(error);
    }
}

//Edit user Code
const editUserLoad = async(req,res)=>{
    try{

        const AdminData = await User.findById({_id : req.session.user_id});
        const id = req.query.id;
        const userData = await User.findById({_id : id});
        
        if(userData){
            res.render('edit-user', {user : userData, admin : AdminData});
        }
        else{
            res.redirect('/admin/dashboard');
        }

    }
    catch(error){
        console.log(error);
    }
}

//post
const updateUsers = async(req,res)=>{
    try{

        const updateData = await User.findByIdAndUpdate({_id : req.body.id}, {$set : { name : req.body.name , email : req.body.email , mobile : req.body.mno , is_varified : req.body.verify , price : req.body.price, carname : req.body.carname  }});

        res.redirect('/admin/dashboard');

    }
    catch(error){
        console.log(error.message);
    }
}

//delete user
const deleteUser = async(req,res)=>{
    try{

        const id = req.query.id;
        await User.deleteOne({ _id : id });
        res.redirect('/admin/dashboard');

    }
    catch(error){
        console.log(error.message);
    }
}

module.exports = {
    loadLogin,
    verfyLogin,
    loadDashboard,
    logout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    adminDashboard,
    editUserLoad,
    updateUsers,
    deleteUser,
}