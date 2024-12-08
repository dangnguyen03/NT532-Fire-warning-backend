const Device = require('../models/Device')

const deviceController =
{

    addRasp : async(req,res) => {
        try {
            //Tạo mới
            const newDevice = new Device({
                macRasp : req.body.macRasp,
                user: req.body.user
            })
            const dv = await newDevice.save();
            res.status(200).json(dv);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    getAllRasp: async(req, res) =>
    {
        try {
            const devices = await Device.find({user:  req.body.username})
            res.status(200).json(devices);      
        } 
        catch (error) {
            res.status(500).json(error)
        }
    },
    deleteRasp: async(req,res) =>
    {
        try {
            const dlRasp = await Device.findOneAndDelete({macRasp: req.params.macRasp})
            res.status(200).json('Success to delete')
        } catch (error) {
            res.status(500).json(error)
        }
    }
    // getRasp: async(req, res) =>
    //     {
    //         try {
    //             const Device = await Device.findOne({user:  req.params.username})
    //             if (Device) {
    //                 req.status(200).json(req.params.username);
    //             } else {
    //             req.status(404).json("Device not found");
    //             }        
    //         } 
    //         catch (error) {
    //             res.status(500).json(error)
    //         }
    //     },


}

module.exports = deviceController

