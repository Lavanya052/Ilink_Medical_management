const jwt = require("jsonwebtoken");
const returnStatus = require("../helpers/returnStatus");

function verifyToken(req,res,next){

    //get token from header part of req
    const token =req.headers.authorization?.split(" ")[1];
    
    // console.log(token,'from verifytoken')

    if(!token){
        return returnStatus(res,401,true,"Unauthorized-No token proided");   
    }

    jwt.verify(token,process.env.secret,(err,decoded)=>{
        if(err){
            return returnStatus(res,401,true,"Unauthorized-Invalid token");   
        }
        //attach decoded paylosd to the req.object it contain email,iat,exp
        req.decodedtoken=decoded
        next();
    });

}


module.exports =verifyToken