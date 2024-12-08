const mongoose = require('mongoose');

const macSchema = new mongoose.Schema(
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
module.exports = mongoose.model("MacESP", macSchema)