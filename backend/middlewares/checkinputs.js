const returnStatus = require("../helpers/returnStatus")

function checkPassword(req, res, next) {
    const { password } = req.body;

    if (!password) {
        returnStatus(res, 400, true, "Password is missing");
        return next(new Error("Password.is missing"));
        //infom server
    }
    if (password.length > 20) {
        returnStatus(res, 400, true, "Password too long");
        return next(new Error("Password too long,max 20 allowed"));
    }
    next();
}

function checkEmail(req, res, next) {
    const { email } = req.body;

    if (!email) {
        returnStatus(res, 400, true, "Email is missing");
        return next(new Error("Email.is missing"));
        //infom server
    }



    if (email.length > 75) {
        returnStatus(res, 400, true, "Email too long");
        return next(new Error("Email too long"));
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const result = emailRegex.test(email);

    if (!result) {
        returnStatus(res, 400, true, "Email is invalid");
        return next(new Error("Email is invalid"));
    }
    next();
}

function checkId(req, res, next) {
    const { id } = req.body;
    if (!id) {
        returnStatus(res, 400, true, "Id is missing");
        return next(new Error("Id is missing"));
        //infom server
    }
    const idRegex = /^[DP]\d{4}$/;
    const result = idRegex.test(id);

    if (!result) {
        returnStatus(res, 400, true, "ID number is invalid");
        return next(new Error("ID number is invalid"));
    }
    next();
}

function checkUsername(req, res, next) {
    const { username } = req.body;
    if (!username) {
        returnStatus(res, 400, true, "username is missing");
        return next(new Error("username is missing"));
        //infom server
    }


    if (username.length > 50) {
        returnStatus(res, 400, true, "Username too long");
        return next(new Error("Username too long"));
    }

    const usernameRegex = /^[a-zA-Z\s]+$/
    const result = usernameRegex.test(username);

    if (!result) {
        returnStatus(res, 400, true, "Username is invalid");
        return next(new Error("Username is invalid"));
    }
    next();
}

function checkPhone(req, res, next) {
    const { phone } = req.body;
    if (!phone) {
      returnStatus(res, 400, true, "Phone number is missing");
      return next(new Error("Phone number is missing"));
    }
  
    if (phone.length > 17) {
      returnStatus(res, 400, true, "Phone number too long");
      return next(new Error("Phone number too long"));
    }
  
    // Allow hyphen (-) in phone number format
    // const phoneRegex = /^[0-9-+]+$/; 
    const phoneRegex = /^(?:\+?\d{1,3})?[0-9-]{10,15}$/;
    const result = phoneRegex.test(phone);
  
    if (!result) {
      returnStatus(res, 400, true, "Phone number is invalid");
      return next(new Error("Phone number is invalid"));
    }
    next();
  }
  
  function checkAddress(req, res, next) {
    const { address } = req.body;
    if (!address) {
        returnStatus(res, 400, true, "Address is missing");
        return next(new Error("Address is missing"));
    }

    if (address.length > 100) {
        returnStatus(res, 400, true, "Address too long");
        return next(new Error("Address too long"));
    }

    const addressRegex = /^[a-zA-Z0-9\s.,/'-]+$/;
    const result = addressRegex.test(address); // Corrected this line

    if (!result) {
        returnStatus(res, 400, true, "Address is invalid");
        return next(new Error("Address is invalid"));
    }
    next();
}


function checkMedicalRecords(req,res,next){
    const { medicalRecord } = req.body;
    if(medicalRecord.len>500){
        returnStatus(res, 400, true, "Medical Record too long");
        return next(new Error("Medical Record too long"));
    }

    const medicalRegex=/^(?:[^<>|]*)$/

    const result =medicalRegex.test(medicalRecord);

    if (!result) {
        returnStatus(res, 400, true, "Medical Record is invalid");
        return next(new Error("Medical Record is invalid"));
    }
    next();

}

function checkIdentifier (req, res, next){
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: "Identifier is required" });
    }
  
    // Simple regex to check if the identifier is an email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    // Simple regex to check if the identifier is an ID (alphanumeric, length 3-30)
    const idRegex = /^[DPA]\d{4}$/;
  
    // Simple regex to check if the identifier is a phone number
    const phoneRegex = /^(?:\+?\d{1,3})?[0-9-]{10,15}$/;;
  
    if (emailRegex.test(identifier)) {
      req.body.isEmail = true;
      req.body.isPhone = false;
    } else if (idRegex.test(identifier)) {
      req.body.isEmail = false;
      req.body.isPhone = false;
    } else if (phoneRegex.test(identifier)) {
      req.body.isEmail = false;
      req.body.isPhone = true;
    } else {
        return returnStatus(res, 401, true,  "Invalid identifier format. It should be either a valid email,Id,Phone No.");
    }
  
    next();
  };
  
module.exports = {
    checkEmail,
    checkPassword,
    checkId,
    checkAddress,
    checkPhone,
    checkUsername,
    checkMedicalRecords,
    checkIdentifier,
}