const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController")
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


router.get('/timeslots',appointmentController.getDoctorAvailability);

router.post('/bookappointment', verifyToken, appointmentController.bookAppointment);

router.get('/getappointments',appointmentController.getAppointments);

router.get('/getdoctorappointments',appointmentController.getDoctorAppointments);

router.get('/pending-appointments',appointmentController.getPendingDoctorAppointments);

router.post('/doctorstatus',verifyToken,appointmentController.doctorStatus)

router.get('/allappointments',verifyToken,appointmentController.getAllAppointments)

router.get('/alldocappointments',verifyToken,appointmentController.getAllDoctorAppointments)

router.use((err, req, res, next) => {
    console.log("from appoinment router middleware:", err.message);

})
module.exports = router;