
const { getDatabase, client } = require("../helpers/connectDB")
const bcrypt = require('bcrypt');
const returnStatus = require("../helpers/returnStatus");
const createToken = require("../helpers/createToken");
const createHash = require("../helpers/createHash");
const createImage = require("../helpers/createImage");
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');

const patientsController = {
    registerPatient: async (req, res, next) => {
        try {
            const db = await getDatabase();
            const doctorid = await db.collection("doctors").findOne({
                $or: [{ email: req.body.email }, { id: req.body.id }],
            });
            if (doctorid) {
                return returnStatus(res, 400, true, "You can't register patient using this id number or email");
            }
            const doctor = await db.collection("doctors").findOne({
                email: req.decodedtoken.email,
            });
            const admin = await db.collection("admin").findOne({
                email: req.decodedtoken.email,
            });
            const emailExistsForAdmin = await db.collection("admin").findOne({
                email: req.body.email,
            });
            if (emailExistsForAdmin) {
                return returnStatus(res, 400, true, "You can't register patient using this email")
            }
            const medicalRecord = doctor ? [
                {
                    date: new Date().toLocaleDateString("en-GB"),
                    record: req.body.medicalRecord
                }
            ] : [];
            if (doctor || admin) {
                const patients_collection = db.collection("patients");
                const patient = await patients_collection.findOne({
                    $or: [{ email: req.body.email }, { id: req.body.id }],
                })
                if (patient) {
                    return returnStatus(res, 400, true, "Patient already exists")
                }
                const imagePath = req.uploadedImageFilePath;
                const imageData = await fs.readFile(imagePath);
                const result = await patients_collection.insertOne({
                    id: req.body.id,
                    email: req.body.email,
                    // username: req.body.username,
                    phone: req.body.phone,
                    firstName: req.body.firstName,
                    lastName: req.body.lastName,
                    address: req.body.address,
                    // city:req.body.city,
                    // state:req.body.state,
                    // zipcode:req.body.zipCode,
                    birthday: req.body.birthday,
                    gender: req.body.gender,
                    // password: hash,
                    image: {
                        data: Buffer.from(imageData).toString("base64"),
                        contentType: req.uploadedImageMimetype
                    }
                });

                console.log("Patient added")
                return returnStatus(res, 201, false, "Patient added")
            }
            return returnStatus(res, 401, true, "You aren't allowed to register a patient");
        } catch (err) {
            console.log(err);
            returnStatus(res, 500, true, "Internal server error");
            return next(new Error())
        }
        finally {
            await client.close()
        }
    },

    searchPatient: async (req, res, next) => {
        try {
            const db = await getDatabase();
            const usernameQuery = req.query.username ? req.query.username.trim() : null;
            const idQuery = req.query.id ? req.query.id.toString().trim() : null;

            const query = {
                $or: [
                    usernameQuery ? { username: { $regex: usernameQuery, $options: 'i' } } : null,
                    idQuery ? { id: { $regex: idQuery, $options: 'i' } } : null
                ].filter(condition => condition !== null)
            };

            const patients = await db.collection("patients").find(query, {
                projection: { _id: 0, password: 0 }
            }).toArray();

            if (patients.length > 0) {
                // Assuming patients array needs no special formatting like image data
                return returnStatus(res, 200, false, "Patients Found", { patients });
            } else {
                return returnStatus(res, 404, true, "No patients found");
            }
        } catch (err) {
            console.error(err);
            return returnStatus(res, 500, true, "Internal server error");
        }
        finally {
            await client.close()
        }
    },

    // Delete patient by ID
    deletePatient: async (req, res, next) => {
        try {
            const { id } = req.params;
            const db = await getDatabase();
            const admin = await db.collection("admin").findOne({
                email: req.decodedtoken.email,
            });
            if (admin) {
                const patient = await db.collection("patients").findOneAndDelete({ id: id });
                if (!patient.value) {
                    return returnStatus(res, 404, true, "Patient not found.");
                }
                return returnStatus(res, 200, false, "Patient deleted successfully.");
            }
            return returnStatus(res, 401, true, "Unauthorized access.");
        } catch (err) {
            console.error(err);
            return returnStatus(res, 500, true, "Internal server error.");
        }
        finally {
            if (client) {
                await client.close();
            }
        }
    },
    // Edit medical record for a patient
    editMedicalRecord: async (req, res, next) => {
        try {
            const { id, index, medicalRecord } = req.body;
            const db = await getDatabase();
            const doctor = await db.collection("doctors").findOne({
                email: req.decodedtoken.email,
            });
            if (doctor) {
                const patient = await db.collection("patients").findOneAndUpdate(
                    { id: id },
                    {
                        $set: {
                            [`medicalRecord.${index}.record`]: medicalRecord,
                        },
                    },
                    {
                        returnDocument: "after",
                        projection: { _id: 0, password: 0 },
                    }
                );
                if (!patient.value) {
                    return returnStatus(res, 404, true, "Patient not found.");
                }
                return returnStatus(res, 200, false, "Medical record updated successfully.", {
                    patient: patient.value,
                });
            }
            return returnStatus(res, 401, true, "Unauthorized access.");
        } catch (err) {
            console.error(err);
            return returnStatus(res, 500, true, "Internal server error.");
        }
        finally {
            if (client) {
                await client.close();
            }
        }
    },
    // Delete medical record for a patient
    deleteMedicalRecord: async (req, res, next) => {
        try {
            const { id, index } = req.body;
            const db = await getDatabase();
            const doctor = await db.collection("doctors").findOne({
                email: req.decodedtoken.email,
            });
            if (doctor) {
                const patient = await db.collection("patients").findOneAndUpdate(
                    { id: id },
                    {
                        $pull: {
                            medicalRecord: { $elemMatch: { index: index } },
                        },
                    },
                    {
                        returnDocument: "after",
                        projection: { _id: 0, password: 0 },
                    }
                );
                if (!patient.value) {
                    return returnStatus(res, 404, true, "Patient not found.");
                }
                return returnStatus(res, 200, false, "Medical record deleted successfully.", {
                    patient: patient.value,
                });
            }
            return returnStatus(res, 401, true, "Unauthorized access.");
        } catch (err) {
            console.error(err);
            return returnStatus(res, 500, true, "Internal server error.");
        }
        finally {
            if (client) {
                await client.close();
            }
        }
    },
    getAllPatients: async (req, res, next) => {
        let client;
        try {
            const db = await getDatabase();
            const patients = await db.collection("patients").find({}, {
                projection: { _id: 0, password: 0 }
            }).toArray();
            if (patients.length > 0) {
                const formattedPatients = patients.map(patient => ({
                    ...patient,

                }));
                return returnStatus(res, 200, false, "Patients Found", { patients: formattedPatients });
            } else {
                return returnStatus(res, 404, true, "No patients found");
            }
        } catch (err) {
            console.error(err);
            returnStatus(res, 500, true, "Internal server error");
            return next(new Error())
        }
        finally {
            if (client) {
                await client.close();
            }
        }
    },

    fetchPatients: async (req, res, next) => {
        try {
            const db = await getDatabase();
            const patientName = req.params.patientName ? req.params.patientName.trim() : null;

            // console.log(patientName)
            if (!patientName) {
                return returnStatus(res, 400, true, "Patient name parameter is required");
            }

            const query = {
                $or: [
                    { firstName: { $regex: patientName, $options: 'i' } },
                    { lastName: { $regex: patientName, $options: 'i' } }
                ]
            };

            const patients = await db.collection("patients").find(query, {
                projection: { _id: 0, id: 1, firstName: 1, lastName: 1, phone: 1 }
            }).toArray();

            // console.log(patients)
            if (patients.length > 0) {
                return returnStatus(res, 200, false, "Patients Found", { patients });
            } else {
                return returnStatus(res, 404, true, "No patients found matching the search criteria");
            }
        } catch (err) {
            console.error(err);
            returnStatus(res, 500, true, "Internal server error");
            return next(new Error())
        } finally {
            if (client) {
                await client.close();
            }
        }
    },

    // Add this method to patientsController
    getPatientDetails: async (req, res, next) => {
        try {
            const { id } = req.query;
            // console.log(id)
            const db = await getDatabase();

            // Find the patient by ID
            const patient = await db.collection("patients").findOne({ id: id }, {
                projection: { _id: 0, password: 0 } // Exclude sensitive fields
            });

            if (!patient) {
                return returnStatus(res, 404, true, "Patient not found");
            }

            return returnStatus(res, 200, false, "Patient details retrieved successfully", {
                patient: patient,
            });
        } catch (err) {
            console.error(err);
            return returnStatus(res, 500, true, "Internal server error");
        } finally {
            if (client) {
                await client.close();
            }
        }
    },

    editPatient: async (req, res, next) => {
        try {
            const db = await getDatabase();
            const { id, email, phone, firstName, lastName, address, birthday, gender } = req.body;
            const updateFields = {};

            if (id) updateFields.id = id;
            if (email) updateFields.email = email;
            if (phone) updateFields.phone = phone;
            if (firstName) updateFields.firstName = firstName;
            if (lastName) updateFields.lastName = lastName;
            if (address) updateFields.address = address;
            if (birthday) updateFields.birthday = birthday;
            if (gender) updateFields.gender = gender;

            // Handle image update
            if (req.uploadedImageFilePath) {
                const imageData = await fs.readFile(req.uploadedImageFilePath);
                updateFields.image = {
                    data: Buffer.from(imageData).toString("base64"),
                    contentType: req.uploadedImageMimetype
                };
            }

            const patient = await db.collection("patients").findOneAndUpdate(
                { id: id },
                { $set: updateFields },
                {
                    projection: { _id: 0, password: 0 }
                }
            );

            if (!patient) {
                return returnStatus(res, 404, true, "Patient not found");
            }

            return returnStatus(res, 201, false, "Patient info updated successfully");
        } catch (err) {
            console.log(err);
            return returnStatus(res, 500, true, "Internal server error");
            return next(new Error());
        } finally {
            if (client) {
                await client.close();
            }
        }
    },

    addMedicalRecord: async (req, res, next) => {
        let client;
        try {
            const db = await getDatabase();
            client = db.client;
    
            const { id, title, description, doctorId } = req.body;
    
            if (!id || !title || !description || !doctorId) {
                return returnStatus(res, 400, true, "Missing required fields");
            }
    
            const currentDate = new Date().toLocaleDateString("en-GB"); // Format as dd/mm/yyyy
    
            // Check if the patient exists
            const patientExists = await db.collection("patients").findOne({ id });
    
            if (!patientExists) {
                return returnStatus(res, 404, true, "Patient not found");
            }
    
            // Find existing medical record for the patient
            const existingPatientRecord = await db.collection("medicalrecords").findOne({ id });
    
            if (existingPatientRecord) {
                // Find the doctor's record
                const doctorRecord = existingPatientRecord.medicalRecord.find(record => record.doctorId === doctorId);
    
                if (doctorRecord) {
                    // Find if the current date already exists in the doctor's records
                    const dateRecord = doctorRecord.records.find(record => record.date === currentDate);
    
                    if (dateRecord) {
                        // Date record exists, add the new entry
                        await db.collection("medicalrecords").updateOne(
                            { id, "medicalRecord.doctorId": doctorId, "medicalRecord.records.date": currentDate },
                            {
                                $push: {
                                    "medicalRecord.$[doctor].records.$[date].entries": { title, description }
                                }
                            },
                            {
                                arrayFilters: [
                                    { "doctor.doctorId": doctorId },
                                    { "date.date": currentDate }
                                ]
                            }
                        );
    
                        return returnStatus(res, 200, false, "Medical record updated", {
                            record: existingPatientRecord
                        });
                    } else {
                        // Date record does not exist, add a new date record
                        await db.collection("medicalrecords").updateOne(
                            { id, "medicalRecord.doctorId": doctorId },
                            {
                                $push: {
                                    "medicalRecord.$.records": {
                                        date: currentDate,
                                        entries: [{ title, description }]
                                    }
                                }
                            }
                        );
    
                        return returnStatus(res, 200, false, "Medical record updated with new date", {
                            record: existingPatientRecord
                        });
                    }
                } else {
                    // Doctor record does not exist, add a new doctor record
                    await db.collection("medicalrecords").updateOne(
                        { id },
                        {
                            $push: {
                                medicalRecord: {
                                    doctorId,
                                    records: [{
                                        date: currentDate,
                                        entries: [{ title, description }]
                                    }]
                                }
                            }
                        }
                    );
    
                    return returnStatus(res, 200, false, "Medical record updated with new doctor", {
                        record: existingPatientRecord
                    });
                }
            } else {
                // Insert new medical record for the patient
                const newRecord = {
                    id,
                    medicalRecord: [{
                        doctorId,
                        records: [{
                            date: currentDate,
                            entries: [{ title, description }]
                        }]
                    }]
                };
    
                const result = await db.collection("medicalrecords").insertOne(newRecord);
    
                return returnStatus(res, 201, false, "New medical record added", {
                    record: result
                });
            }
        } catch (err) {
            console.error("Error adding medical record:", err);
            return returnStatus(res, 500, true, "Internal server error");
        } finally {
            if (client) {
                await client.close();
            }
        }
    },
    

    myPatients: async (req, res, next) => {
        let client;
        try {
            const { doctorId } = req.query; // Get doctor ID from query parameters
            const db = await getDatabase();
    
            // Fetch data from the appointments collection
            const appointmentsData = await db.collection("appointments").find({
                "doctors.doctorId": doctorId
            }).toArray();
    
            // Extract patient IDs from the appointments
            const patientIds = appointmentsData.flatMap(appointment =>
                appointment.doctors.flatMap(doctor =>
                    doctor.appointments
                        .filter(a => a.doctorStatus === "accepted")
                        .map(a => a.patientId)
                )
            );
    
            // Fetch patient details using the patient IDs
            const patients = await db.collection("patients").find({
                id: { $in: patientIds }
            }, {
                projection: { _id: 0, password: 0 } // Exclude sensitive fields
            }).toArray();
    
            // Fetch doctor details
            const doctors = await db.collection("doctors").find({
                id: doctorId
            }).toArray();
    
            // Create a map of patient IDs to patient details for quick lookup
            const patientMap = new Map(patients.map(p => [p.id, p]));
    
            // Map patient details to appointments
            const appointmentsWithPatientDetails = appointmentsData.map(appointment => {
                return {
                    ...appointment,
                    doctors: appointment.doctors.map(doctor => ({
                        ...doctor,
                        appointments: doctor.appointments.map(app => {
                            if (app.doctorStatus === "accepted") {
                                const patient = patientMap.get(app.patientId);
                                return {
                                    ...app,
                                    patientDetails: patient || {} // Add patient details
                                };
                            }
                            return app;
                        })
                    }))
                };
            });
    
            return returnStatus(res, 200, false, "Data from all collections retrieved successfully", {
                patients
            });
        } catch (err) {
            console.error(err);
            return returnStatus(res, 500, true, "Internal server error");
        } finally {
            if (client) {
                await client.close();
            }
        }
    },    
    
    

};
module.exports = patientsController; 
