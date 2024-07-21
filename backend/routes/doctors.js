const express = require("express");
const router = express.Router();
const doctorsController = require("../controllers/doctorsController")
const returnStatus = require("../helpers/returnStatus")
const verifyToken = require("../middlewares/verifyToken");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const {
    checkAddress,
    checkEmail,
    checkId,
    checkPassword,
    checkPhone,
    checkUsername
} = require("../middlewares/checkinputs")




router.post("/registerdoctor", verifyToken, (req, res, next) => {
    const uploadDir = path.join(__dirname, "..", "uploads");

    const form = new formidable.IncomingForm({
        uploadDir: uploadDir,
        maxFileSize: 1 * 1024 * 1024
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return returnStatus(res, 400, true, "Error uploading file, file limit is 1MB");
        }

        const formData = JSON.parse(fields.data);

        if (formData) {
            const { id,email,phone,password,username,firstName,lastName,address,city,state,zipCode,speciality,gender,emergencyPhone } = formData;
            req.body.id = id;
            req.body.phone = phone;
            req.body.email = email;
            req.body.password = password;
            req.body.username = username;
            req.body.firstName=firstName;
            req.body.lastName=lastName;
            req.body.address=address;
            // req.body.city=city;
            // req.body.state=state;
            // req.body.zipCode=zipCode;
            req.body.speciality=speciality;
            req.body.gender=gender;
            req.body.emergencyPhone=emergencyPhone;

            req.uploadedImageFilePath = files.file[0].filepath;
            req.uploadedImageName = files.file[0].originalFilename;
            req.uploadedImageMimetype = files.file[0].mimetype;

            next();
        } else {
            return returnStatus(res, 400, true, "Invalid form data");
        }
    });
}, checkId, checkEmail, checkPassword, checkUsername, checkPhone, doctorsController.registerDoctor);

// router.get("/searchdoctor",checkId,doctorsController.searchDoctor)
router.get("/searchdoctor",doctorsController.searchDoctor)


router.get("/alldoctors", doctorsController.getAllDoctors);
router.get("/getavailability/:doctorId", doctorsController.getAvailability);
router.get("/getspeciality/:speciality", doctorsController.getSpeciality);
router.post("/updatedoctor",verifyToken,checkId,checkEmail,
  checkPhone,doctorsController.updateContact
)

router.post("/addavailability",verifyToken,doctorsController.addAvailability)

router.use((err, req, res, next) => {
  if (req.uploadedImageFilePath) { 
    fs.unlink(req.uploadedImageFilePath, (err) => {
      if (err) {
        console.log("Error deleting temporary file", err);
      } else {
        console.log("File is deleted Successfully");
      }
    });
  }
  console.log("FROM doctors route middleware", err.message);
});

module.exports = router; 