const bcrypt = require('bcrypt');
const saltRounds = 10;


async function createHash(password){
    return bcrypt.hash(password,saltRounds).then((hash)=>{
        // console.log(hash);
        return hash;
    }).catch((err)=>{
        console.log(err);
        return err;
    })
}

// createHash("admin123");

module.exports=createHash;