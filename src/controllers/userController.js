const User = require('../models/User')
const bcrypt = require('bcrypt')

const userController =
{
    //Get all
    getAllUser: async (req, res) =>
    {
        try {
            const user = await User.find();
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    //Xoa user
    deleteUser: async(req,res) =>
    {
        try {
            const user = await User.findByIdAndDelete(req.params.id)
            req.status(200).json("Delete success")
        } catch (error) {
            res.status(500).json(error)
        }
    },
    updateUser: async(req,res) =>
    {
        try {

            // Kiểm tra xem người dùng có tồn tại hay không
            const user = await User.findOne({ username: req.body.username });
            if (!user) {
                return res.status(404).json({ error: 'Người dùng không tồn tại' });
            }
            const validPassword = await bcrypt.compare(req.body.password, user.password)
            if (!validPassword)
            {
                res.status(404).json("Wrong pass"); return
            }
            if (user && validPassword)
            {
                try {
                    const salt = await bcrypt.genSalt();
                    const hashed = await bcrypt.hash(req.body.newpassword, salt);

                    
                    user.password = hashed;
                    await user.save();
                    res.json({ message: 'Change password success' });
                } catch (error) {
                    console.error('Lỗi:', error);
                    res.status(500).json({ error: 'Đã xảy ra lỗi' });
                }
            }
        } catch (error) {
            console.error('Lỗi:', error);
            res.status(500).json({ error: 'Đã xảy ra lỗi' });
        }
    }
}

module.exports = userController