const mongoose = require('mongoose');

const espSchema = new mongoose.Schema(
    {
        macAddr: {
            type: String,
            unique: true
        },
        macRasp:
        {
            type: String,
        }
    },{timestamps:true}
);
module.exports = mongoose.model("ESPqueue", espSchema)