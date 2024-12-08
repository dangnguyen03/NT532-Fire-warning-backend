
const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

let arrayRefreshToken = []
const authController = 
{
    //đăng ký
    registerUser : async(req,res) => {
        try {
            const salt = await bcrypt.genSalt();
            const hashed = await bcrypt.hash(req.body.password, salt);

            //Tạo mới
            const newUser = await new User({
                username : req.body.username,
                email : req.body.email,
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                password: hashed
            })
            const user = await newUser.save();
            res.status(200).json(user);
        } catch (error) {
            res.status(500).json(error)
        }
    },
    generateAccessToken : (user) =>
    {
        return jwt.sign(
            {
                id : user.id,
                admin: user.admin
            }, process.env.jwt_access_key,
            {
                expiresIn: '300d'
            }    
        );
    },
    generateRefreshToken: (user) =>
    {
        return jwt.sign(
            {
                id : user.id,
                admin: user.admin
            }, process.env.jwt_refresh_key,
            {
                expiresIn: '300d'
            }    
        )
    },
    loginUser: async (req, res) =>
    {
        try {
            const user = await User.findOne({username: req.body.username})
            if (!user )
            {
                res.status(404).json("Wrong username"); return
            }
            const validPassword = await bcrypt.compare(req.body.password, user.password)
            if (!validPassword)
            {
                res.status(404).json("Wrong pass"); return
            }
            if (user && validPassword)
            {
                const accessToken = authController.generateAccessToken(user);
                const refreshToken = authController.generateRefreshToken(user);
                arrayRefreshToken.push(refreshToken)
                res.cookie("refreshToken", refreshToken,{
                    httpOnly: true,
                    secure: false,
                    path:'/',
                    sameSite: "strict"
                })
                const {password, ...others} = user._doc   
                res.status(200).json({...others, accessToken})
            }
        } catch (error) {
           res.status(500).json(error)
        }
    },
    requestRefreshToken: async (req, res) =>
    {
        const refreshToken = req.cookies.refreshToken;
        //res.status(200).json(requestToken)
        if (!refreshToken) return res.status(401).json("You're not authenticated");
        if (!arrayRefreshToken.includes(refreshToken)) 
        {
            return res.status(403).json('Refresh token is not valid')
        }
        jwt.verify(refreshToken, process.env.jwt_refresh_key, (error, user) => {
            if (error) 
            {
                console.log(error)
            }
            arrayRefreshToken = arrayRefreshToken.filter((token) => token !== refreshToken)
            const newAccessToken = authController.generateAccessToken(user)
            const newRefreshToken = authController.generateRefreshToken(user)
            arrayRefreshToken.push(refreshToken)
            res.cookie("refreshToken", newRefreshToken,{
                httpOnly: true,
                secure: false,
                path:'/',
                sameSite: "strict"
            })
            res.status(200).json({accessToken:newAccessToken})

        })
    },
    userLogOut: async (req,res) =>
    {
        res.clearCookie("refreshToken");
        arrayRefreshToken = arrayRefreshToken.filter(token => token !== req.cookies.refreshToken)
        res.status(200).json("Logged out!")
    }
}


module.exports = authController