
const { getDatabase, client } = require("../helpers/connectDB")
const bcrypt = require('bcrypt');
const returnStatus = require("../helpers/returnStatus");
const createToken = require("../helpers/createToken");
const createHash = require("../helpers/createHash");
const createImage = require("../helpers/createImage")
const fs = require('fs').promises;
const path = require('path');
const moment = require('moment');
const { format } = require("util");
const doctorsController = {
    registerDoctor: async (req, res, next) => {
        let client;
        try {
            const db = await getDatabase();
            client = db.client;
            // admin email
            const admin = await db.collection("admin").findOne({
                email: req.decodedtoken.email,
            });
            if (!admin) {
                returnStatus(res, 400, true, "Unauthorized request");
                return next(new Error());
            }
            // doctor email not equal to admin email (important)
            const emailExistsForAdmin = await db.collection("admin").findOne({
                email: req.body.email,
            });
            if (emailExistsForAdmin) {
                returnStatus(res, 400, true, "You can't register doctor using this email");
                return next(new Error());
            }
            // check id, email (multiple values)
            const patient = await db.collection("patients").findOne({
                $or: [{ email: req.body.email }, { id: req.body.id }],
            });
            if (patient) {
                returnStatus(res, 400, true, "You can't register doctor using this id or email");
                return next(new Error());
            }
            const doctor = await db.collection("doctors").findOne({
                $or: [{ email: req.body.email }, { id: req.body.id }],
            });
            if (doctor) {
                returnStatus(res, 400, true, "Doctor already registered");
                return next(new Error());
            }
            const hash = await createHash(req.body.password);
            const imagePath = req.uploadedImageFilePath;
            const imageData = await fs.readFile(imagePath);
            const result = await db.collection("doctors").insertOne({
                id: req.body.id,
                email: req.body.email,
                username: req.body.username,
                phone: req.body.phone,
                emergencyPhone: req.body.emergencyPhone,
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                address: req.body.address,
                // city:req.body.city,
                // state:req.body.state,
                // zipcode:req.body.zipCode,
                speciality: req.body.speciality,
                gender: req.body.gender,
                password: hash,
                image: {
                    data: Buffer.from(imageData).toString("base64"),
                    contentType: req.uploadedImageMimetype
                }
            });
            console.log("doctor registered");
            return returnStatus(res, 201, false, "Doctor Registered");
        } catch (err) {
            console.log(err);
            returnStatus(res, 500, true, "Internal server error");
            return next(new Error());
        }
        finally {
            await client.close()
        }
    },
    searchDoctor: async (req, res, next) => {
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
            const doctors = await db.collection("doctors").find(query, {
                projection: { _id: 0, password: 0 }
            }).toArray();
            if (doctors.length > 0) {
                // Ensure the image data is correctly formatted
                const formattedDoctors = doctors.map(doctor => ({
                    ...doctor,
                    imageUrl: doctor.image ? `data:${doctor.image.contentType};base64,${doctor.image.data}` : null
                }));
                return returnStatus(res, 200, false, "Doctors Found", { doctors: formattedDoctors });
            } else {
                return returnStatus(res, 404, true, "No doctors found");
            }
        } catch (err) {
            console.error(err);
            return returnStatus(res, 500, true, "Internal server error");
        }
        finally {
            await client.close()
        }
    },
    updateContact: async (req, res) => {
        try {
            const { phone, email, id } = req.body;
            const db = await getDatabase();
            const admin = await db.collection("admin").findOne({
                email: req.decodedtoken.email, //compare both sides
            });
            if (admin) {
                const adminExists = await db.collection("admin").findOne({
                    email: email
                })
                const patientExists = await db.collection("patients").findOne({
                    $or: [{ email: email }, { phone: phone }],
                });
                if (doctorExists || patientExists || adminExists) {
                    return returnStatus(res, 401, true, "This email or Phone already exist")
                }
                const doctor = await db.collection("doctors").findOneAndUpdate(
                    { id: id },
                    {
                        $set: {
                            email: email,
                            phone: phone
                        },
                    }, {
                    returnDocument: "after",
                    projection: { _id: 0, password: 0 },
                }
                );
                if (!doctor) {
                    return returnStatus(res, 404, true, "Doctor not Found")
                }
                const doctorJson = JSON.stringify(doctor);
                return returnStatus(res, 201, false, "Doctor Updates", {
                    doctor: doctorJson,
                })
            };
            return returnStatus(res, 402, true, "Unauthorized")
        } catch (err) {
            console.log(err);
            returnStatus(res, 500, true, "Internal server error");
            return next(new Error())
        }
        finally {
            await client.close()
        }
    },
    getAllDoctors: async (req, res, next) => {
        try {
            const db = await getDatabase();
            const doctors = await db.collection("doctors").find({}, {
                projection: { _id: 0, password: 0 }
            }).toArray();
            if (doctors.length > 0) {
                const formattedDoctors = doctors.map(doctor => ({
                    ...doctor,
                    imageUrl: doctor.image ? `data:${doctor.image.contentType};base64,${doctor.image.data}` : null
                }));
                return returnStatus(res, 200, false, "Doctors Found", { doctors: formattedDoctors });
            } else {
                return returnStatus(res, 404, true, "No doctors found");
            }
        } catch (err) {
            console.error(err);
            return returnStatus(res, 500, true, "Internal server error");
        }
        finally {
            await client.close();
        }
    },

    addAvailability: async (req, res, next) => {
        try {
            const db = await getDatabase();
            const { doctorId, date, availability, overwrite = false } = req.body;
            const formattedDate = moment(date).format('YYYY-MM-DD');

            // Validate and format availability slots
            for (const slot of availability) {
                if (!slot.date || (slot.notAvailable !== true && (!slot.startTime || !slot.endTime || !slot.interval))) {
                    return returnStatus(res, 400, true, "Invalid availability slot data");
                }
                slot.startTime = moment(slot.startTime, 'hh:mm A').format('HH:mm');
                slot.endTime = moment(slot.endTime, 'hh:mm A').format('HH:mm');
            }

            // Fetch existing availability
            const existingAvailability = await db.collection("availability").findOne({ doctorId });

            if (existingAvailability) {
                // Check for conflicts
                for (const newSlot of availability) {
                    const conflict = existingAvailability.dates.find(dateEntry => {
                        return dateEntry.date === formattedDate && dateEntry.availability.some(oldSlot => {
                            // Check if the newSlot conflicts with any existing slot
                            if (oldSlot.notAvailable) {
                                return oldSlot.date === newSlot.date;
                            } else {
                                return (
                                    oldSlot.date === newSlot.date &&
                                    ((newSlot.startTime >= oldSlot.startTime && newSlot.startTime < oldSlot.endTime) ||
                                        (newSlot.endTime > oldSlot.startTime && newSlot.endTime <= oldSlot.endTime) ||
                                        (newSlot.startTime <= oldSlot.startTime && newSlot.endTime >= oldSlot.endTime))
                                );
                            }
                        });
                    });

                    if (conflict) {
                        // Find the specific conflicting availability slot
                        const conflictingSlot = conflict.availability.find(oldSlot => {
                            if (oldSlot.notAvailable) {
                                return oldSlot.date === newSlot.date;
                            } else {
                                return (
                                    oldSlot.date === newSlot.date &&
                                    ((newSlot.startTime >= oldSlot.startTime && newSlot.startTime < oldSlot.endTime) ||
                                        (newSlot.endTime > oldSlot.startTime && newSlot.endTime <= oldSlot.endTime) ||
                                        (newSlot.startTime <= oldSlot.startTime && newSlot.endTime >= oldSlot.endTime))
                                );
                            }
                        });

                        if (conflictingSlot) {
                            const conflictDetails = conflictingSlot.notAvailable
                                ? "Conflict with existing slot where not available is true"
                                : `Conflict with existing slot on ${conflictingSlot.date} from ${conflictingSlot.startTime} to ${conflictingSlot.endTime} in interval ${conflictingSlot.interval}`;

                            if (!overwrite) {
                                return returnStatus(res, 409, true, `Time slot already assigned. ${conflictDetails}. If you want to overwrite, please set overwrite to true.`);
                            }
                        }
                    }
                }

                // Overwrite existing slots
                if (overwrite) {
                    const updatedDates = existingAvailability.dates.reduce((acc, dateEntry) => {
                        if (dateEntry.date === formattedDate) {
                            // Handle existing date
                            const updatedSlots = dateEntry.availability.map(oldSlot => {
                                const newSlot = availability.find(newSlot =>
                                    oldSlot.date === newSlot.date &&
                                    ((newSlot.startTime >= oldSlot.startTime && newSlot.startTime < oldSlot.endTime) ||
                                        (newSlot.endTime > oldSlot.startTime && newSlot.endTime <= oldSlot.endTime) ||
                                        (newSlot.startTime <= oldSlot.startTime && newSlot.endTime >= oldSlot.endTime))
                                );
                                return newSlot || oldSlot; // Use new slot if found, otherwise keep old slot
                            });
                
                            // Filter out any 'not available' slots if required
                            const filteredSlots = updatedSlots.filter(slot => slot.startTime !== null && slot.endTime !== null);
                            
                            // Only add the date entry if there are available slots
                            if (filteredSlots.length > 0) {
                                acc.push({ ...dateEntry, availability: filteredSlots });
                            }
                        } else {
                            // Keep the dates that are not being overwritten
                            acc.push(dateEntry);
                        }
                        return acc;
                    }, []);
                
                    // If the date doesn't exist, add it
                    if (!updatedDates.find(dateEntry => dateEntry.date === formattedDate)) {
                        updatedDates.push({
                            date: formattedDate,
                            availability
                        });
                    }
                
                    await db.collection("availability").updateOne(
                        { doctorId },
                        { $set: { dates: updatedDates } }
                    );
                
                    console.log("Availability updated for doctor:", doctorId);
                    return returnStatus(res, 200, false, "Availability Updated");
                }
                 else {
                    // Add new slots to existing date or add new date entry
                    const dateEntry = existingAvailability.dates.find(dateEntry => dateEntry.date === formattedDate);

                    if (dateEntry) {
                        // Update availability for the existing date
                        await db.collection("availability").updateOne(
                            { doctorId, "dates.date": formattedDate },
                            { $push: { "dates.$.availability": { $each: availability } } }
                        );
                    } else {
                        // Add a new date entry
                        await db.collection("availability").updateOne(
                            { doctorId },
                            { $push: { dates: { date: formattedDate, availability } } }
                        );
                    }

                    console.log("Availability updated for doctor:", doctorId);
                    return returnStatus(res, 200, false, "Availability Updated");
                }
            } else {
                // Insert new availability
                await db.collection("availability").insertOne({
                    doctorId,
                    dates: [{
                        date: formattedDate,
                        availability
                    }]
                });

                console.log("New availability added for doctor:", doctorId);
                return returnStatus(res, 200, false, "New Availability Added");
            }

        } catch (err) {
            console.error("Error adding/updating availability:", err);
            return returnStatus(res, 500, true, "Internal server error");
        } finally {
            await client.close();
        }
    },

    getAvailability: async (req, res, next) => {
        try {
            const db = await getDatabase();
            const doctorId = req.params.doctorId;

            // Fetch the availability data for the doctor
            const availabilityData = await db.collection("availability").findOne(
                { doctorId: doctorId },
                { projection: { _id: 0, doctorId: 1, dates: 1 } } // Fetch only relevant fields
            );

            if (availabilityData && availabilityData.dates) {
                // Extract availability from the dates array
                const availability = availabilityData.dates.flatMap(dateEntry => dateEntry.availability);

                // console.log(availability)
                return returnStatus(res, 200, false, "Availability Found", { availability });
            } else {
                return returnStatus(res, 404, true, "Availability not found for doctor");
            }
        } catch (err) {
            console.error("Error fetching availability:", err);
            return returnStatus(res, 500, true, "Internal server error");
        } finally {
            await client.close();
        }
    },

    getSpeciality: async (req, res, next) => {
        try {
            const db = await getDatabase();
            const speciality = req.params.speciality;
            // Fetch doctors based on speciality
            const doctors = await db.collection("doctors").find({ speciality: speciality }).toArray();
            if (doctors.length > 0) {
                // Extract only names from the fetched doctors
                const doctorDetails = doctors.map((doctor) => ({
                    id: doctor.id,
                    name: `${doctor.firstName} ${doctor.lastName}`,
                }));
                // Return response with doctor names and IDs
                return returnStatus(res, 200, false, "Doctors Found", { doctors: doctorDetails });
            } else {
                return returnStatus(res, 404, true, "Doctors not found for the specified speciality");
            }
        } catch (err) {
            console.error("Error fetching doctors:", err);
            return returnStatus(res, 500, true, "Internal server error");
        }
    },


};
module.exports = doctorsController;
