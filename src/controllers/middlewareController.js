const jwt = require('jsonwebtoken')

const middlewareController = 
{
    verifyToken: (req, res, next) =>
    {
        try {
            const token = req.headers.token ;
            if(token){
                const accessToken = token.split(" ")[1];
                   // const accessToken = token
                try {
                    jwt.verify(
                        accessToken, process.env.jwt_access_key,  (error,user) =>
                        {
                            if (error)
                            {
                                res.status(403).json("Token is not valid")
                            }
                            req.user = user;
                            next()
                        }
                    );
                
                } catch (error) {
                    res.status(403).json("Token is not valid")
                }
            }
            else
            {
                res.status(401).json("You're are not authenticated")
            }
            
        } catch (error) {
            res.status(500).json(error)
        }
    },
    verifyTokenAndAdminAuth: (req, res, next) =>
    {
        middlewareController.verifyToken(req,res, () =>
            {
                if (req.user.id == req.params.id ||  req.user.admin)
                {
                    next()
                }
                else{
                    res.status(403).json("Not enough authorization!");
                }
            }
        );
    }
}
module.exports = middlewareController