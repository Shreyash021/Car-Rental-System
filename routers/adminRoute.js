

const express = require("express"); 

const admin_route = express();

const session = require('express-session');
const config = require('../config/config');
admin_route.use(session({secret : config.sessionSecret}))


const bodyParser = require('body-parser');
admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended : true}));

admin_route.set('view engine' , 'ejs');
admin_route.set('views','./views/admin');

const auth = require('../middleware/adminAuth');


const adminController = require("../controlller/adminController");

admin_route.get('/', auth.isLogout ,adminController.loadLogin)



admin_route.post('/', adminController.verfyLogin);

//
admin_route.get('/home' , auth.isLogin , adminController.loadDashboard);


//LogOut ADmin
admin_route.get('/logout', auth.isLogin , adminController.logout);


//Route For forget Password
admin_route.get('/forget', auth.isLogout , adminController.forgetLoad);
//Post Forget in Database
admin_route.post('/forget' , adminController.forgetVerify);

//
admin_route.get('/forget-password', auth.isLogout ,adminController.forgetPasswordLoad);

//post
admin_route.post('/forget-password', adminController.resetPassword);

//
admin_route.get('/dashboard' , auth.isLogin , adminController.adminDashboard);

//Edit-user
admin_route.get('/edit-user' , auth.isLogin , adminController.editUserLoad);

//post edited
admin_route.post('/edit-user', adminController.updateUsers);

//delete
admin_route.get('/delete-user' , adminController.deleteUser);



// write anytthinl after /admin/....
admin_route.get('*',function(req,res){
    res.redirect('/admin');
})

module.exports = admin_route;

