const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema(
    {
        macRasp: {
            type: String,
            unique: false,   

        },
        user:{
            type: String,
        },
    },{timestamps:true}
);
module.exports = mongoose.model("Device", deviceSchema)