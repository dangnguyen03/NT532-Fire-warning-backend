const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema(
    {
        temp: {
            type: Number,
        },
        humid: {
            type: Number,
        },
        gas: {
            type: Number,
        },
        macAddr:
        {
            type: String,
        },
        timestamp: {
            type: Date,
            default: Date.now,
        },
    }
);
module.exports = mongoose.model("Data", dataSchema)