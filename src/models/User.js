const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        minlength: 3,
        maxlength: 20,
        unique: true
    },
    firstname:{
        type: String,
        required: true,
        minlength: 1,
        maxlength: 40,
    },
    lastname:{
        type: String,
        required: true,
        minlength: 1,
        maxlength: 40,
    },
    email:{
        type: String,
        required: true,
        minlength:6,
        maxlength:50,
    },
    password:{
        type: String,
        required: true,
        minlength:3,
    },
    admin:
    {
        type: Boolean,
        default: false
    }
}, {timestamps:true}
)
module.exports = mongoose.model("User", userSchema)