const express = require("express");
const router = express.Router();
const patientsController = require("../controllers/patientsController");
const verifyToken = require("../middlewares/verifyToken");
const fs = require("fs");
const path = require("path");
const formidable = require("formidable");
const { checkId,
    checkEmail,
    checkAddress,
    checkMedicalRecords,
    checkPhone,
    checkUsername } = require("../middlewares/checkinputs")



router.post("/registerpatient", verifyToken, (req, res, next) => {
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
            const { id, email, phone, password, username, firstName, lastName, address, city, state, zipCode, birthday, gender } = formData;
            req.body.id = id;
            req.body.phone = phone;
            req.body.email = email;
            // req.body.password = password;
            // req.body.username = username;
            req.body.firstName = firstName;
            req.body.lastName = lastName;
            req.body.address = address;
            // req.body.city=city;
            // req.body.state=state;
            // req.body.zipCode=zipCode;
            req.body.birthday = birthday;
            req.body.gender = gender;

            req.uploadedImageFilePath = files.file[0].filepath;
            req.uploadedImageName = files.file[0].originalFilename;
            req.uploadedImageMimetype = files.file[0].mimetype;

            next();
        } else {
            return returnStatus(res, 400, true, "Invalid form data");
        }
    });
}
    , checkId, checkEmail, checkAddress, checkPhone, patientsController.registerPatient)

router.get("/searchpatient",patientsController.searchPatient)


router.get("/allpatients", patientsController.getAllPatients);
router.get("/fetchPatients/:patientName", patientsController.fetchPatients)

// Route for editing a medical record of a patient
router.post('/editmedicalrecord', patientsController.editMedicalRecord);

// Route for deleting a medical record from a patient
router.post('/deletemedicalrecord', patientsController.deleteMedicalRecord);

router.get('/getpatientDetails',verifyToken, patientsController.getPatientDetails);

router.get('/mypatients',verifyToken, patientsController.myPatients);

router.post("/editpatient", verifyToken, (req, res, next) => {
    
    const uploadDir = path.join(__dirname, "..", "uploads");

    const form = new formidable.IncomingForm({
        uploadDir: uploadDir,
        maxFileSize: 1 * 1024 * 1024 // Set max file size to 1MB
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            return returnStatus(res, 400, true, "Error uploading file, file limit is 1MB");
        }
        // console.log(fields.data)
        const formData = JSON.parse(fields.data);

        if (formData) {
            const { id, email, phone, firstName, lastName, address, birthday, gender } = formData;
            req.body.id = id;
            req.body.phone = phone;
            req.body.email = email;
            req.body.firstName = firstName;
            req.body.lastName = lastName;
            req.body.address = address;
            req.body.birthday = birthday;
            req.body.gender = gender;

            if (files.file) {
                req.uploadedImageFilePath = files.file[0].filepath;
                req.uploadedImageName = files.file[0].originalFilename;
                req.uploadedImageMimetype = files.file[0].mimetype;
            }

            next();
        } else {
            return returnStatus(res, 400, true, "Invalid form data");
        }
    });
}, checkId, checkEmail, checkPhone, patientsController.editPatient);

router.post("/addmedicalrecord",verifyToken,(req,res,next)=>{
    // console.log("in addmedical record")

    const uploadDir = path.join(__dirname, "..", "uploads");

    const form = new formidable.IncomingForm({
        uploadDir: uploadDir,
        maxFileSize: 1 * 1024 * 1024 // Set max file size to 1MB
    });
    
    form.parse(req, async (err, fields, files) => {
    
            const formData = JSON.parse(fields.data);
    
            if (formData) {
                const { id, title, description,doctorId} = formData;
                req.body.id = id;
                req.body.description = description;
                req.body.title = title;
                req.body.doctorId=doctorId;
                next();
            } else {
                return returnStatus(res, 400, true, "Invalid form data");
            }
        });
    }, checkId, patientsController.addMedicalRecord);
    

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
    console.log("FROM patient route middleware", err.message);
  });
module.exports = router;