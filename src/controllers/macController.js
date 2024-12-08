const MacESP = require('../models/MacESP')

const macController =
{

    addEsp : async(req,res) => {
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
    getAllESP: async(req,res) =>
    {
        try {

            const macEsps = await MacESP.find({macRasp: req.params.macRasp})
            res.status(200).json(macEsps);      
        } catch (error) {
            res.status(500).json('Lỗi')    
        }
    },
    getAll: async(req,res) =>
    {
        try {

            const macEsps = await MacESP.find()
            res.status(200).json(macEsps);      
        } catch (error) {
            res.status(500).json('Lỗi')    
        }
    },
    deleteESP: async(req,res) =>
    {
        try {
            const dlESP = await MacESP.findOneAndDelete({macAddr: req.params.macAddr})
            res.status(200).json('Success to delete')
        } catch (error) {
            res.status(500).json(error)
        }
    }

}

module.exports = macController

