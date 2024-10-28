 const mongoose = require("mongoose");

const userSchema = mongoose.Schema({

    name : {
        type : String,
        required : true
    }, 
    email : {
        type : String,
        required : true,
        unique : true
    },
    mobile : {
        type : Number,
        required : true,
        unique : true
    },
    image : {
        type : String,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    
    carname : {
        type : String,
        default :'-' 
    },
    price : {
        type : Number, 
        default : 0
    },

    is_admin : {
        type : Number,
        required : true
    },
    is_varified :{
        type : Number,
        default : 0
    },
    token : {
        type : String,
        default :''
    }

})


const User = mongoose.model("User", userSchema);

module.exports = User;