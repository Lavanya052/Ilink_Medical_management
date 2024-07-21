const jwt=require("jsonwebtoken");

function createToken(payload, expiresIn = '1h'){

    const Token=jwt.sign(payload,process.env.secret,{expiresIn});
    return Token;
}

module.exports=createToken;