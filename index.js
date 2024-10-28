const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/Car_Rent");

const express = require("express");

const app = express();

//For user route
const userRoute = require('./routers/userRoute');
app.use('/',userRoute);


//For admin route
const adminRoute = require('./routers/adminRoute');
app.use('/admin',adminRoute);


app.listen(8080,function(){
    console.log("Server is running...");
})