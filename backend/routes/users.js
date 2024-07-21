const express = require("express");
const usersController = require("../controllers/usersController");
const {checkEmail,checkPassword,checkIdentifier} =require("../middlewares/checkinputs");
const verifyToken = require("../middlewares/verifyToken")
const router =express.Router();



// router.post("/signin",checkEmail,checkPassword,usersController.signIn);
router.post("/signin", checkIdentifier, checkPassword, usersController.signIn);


router.get("/checkifloggedin",verifyToken,usersController.checkifLoggedin);

router.post("/forgotpassword",checkEmail,usersController.forgotPassword);

router.post("/resetpassword/:token",checkPassword,usersController.resetPassword);


router.use((err,req,res,next)=>{
    console.log("from user router middleware:",err.message);
    
})
module.exports=router;