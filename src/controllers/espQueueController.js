const ESPqueue = require('../models/ESPqueue')

const espQueueController =
{

    accept : async(req,res) => {
        try {
            //Tạo mới
            const newMacESP = await new MacESP({
                macAddr : req.body.macAddr,
                macRasp: req.body.macRasp
            })
            const esp = await newMacESP.save();
            res.status(200).json(esp);
        } catch (error) {
            res.status(500).json('Lỗi')
        }
    },
    getAll: async(req,res) =>
        {
            try {
    
                const esp = await ESPqueue.find()
                res.status(200).json(esp);      
            } catch (error) {
                res.status(500).json('Lỗi')    
            }
        },
    
    deleteESPQueue: async(req,res) =>
    {
        try {
            const dlESP = await ESPqueue.findOneAndDelete({macAddr: req.params.macAddr})
            res.status(200).json('Success to delete')
        } catch (error) {
            res.status(500).json(error)
        }
    }

}

module.exports = espQueueController

