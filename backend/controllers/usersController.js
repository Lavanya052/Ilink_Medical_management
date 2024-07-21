const { getDatabase, client } = require("../helpers/connectDB");
const bcrypt = require('bcrypt');
const returnStatus = require("../helpers/returnStatus");
const createToken = require("../helpers/createToken");
const fs = require("fs");
const path = require("path");
const nodemailer = require('nodemailer');
const jwt = require("jsonwebtoken");
const createHash = require("../helpers/createHash");
const usersController = {
    // ----- Signin -------------
    // signIn: async (req, res) => {
    //     try {
    //         const db = await getDatabase();
    //         var user = null;
    //         var person = "";
            
    //         const admin = await db.collection("admin").findOne({
    //             email: req.body.email
    //         });
    //         const doctor = await db.collection("doctors").findOne({
    //             email: req.body.email
    //         });
    //         if (!admin && !doctor) {
    //             return returnStatus(res, 404, true, "Not Found");
    //         }
    //         if (admin) {
    //             user = admin;
    //             person = "admin";
    //         }
    //         if (doctor) {
    //             user = doctor;
    //             person = "doctors";
    //         }
    //         // Hash the password and then compare
    //         bcrypt.compare(req.body.password, user.password, (err, result) => {
    //             if (err || !result) {
    //                 return returnStatus(res, 401, true, "Invalid email or password");
    //             }
    //             // Generate JWT
    //             const newjwt = createToken({ email: user.email });
    //             return returnStatus(res, 200, false, `Welcome ${user.username}`, {
    //                 token: newjwt,
    //                 username: user.username,
    //                 person: person,
    //             });
    //         });
    //     } catch (err) {
    //         console.log(err);
    //         return returnStatus(res, 500, true, "Internal server error");
    //     }    
    //      finally {
    //         if (client) {
    //             await client.close();
    //         }
    //     }
    // },


    signIn: async (req, res) => {
        try {
          const db = await getDatabase();
          let user = null;
          let person = "";
          const { identifier, password, isEmail, isPhone } = req.body;
      
          let searchCriteria = {};
          if (isEmail) {
            searchCriteria.email = identifier;
          } else if (isPhone) {
            searchCriteria.phone = identifier;
          } else {
            searchCriteria.id = identifier;
          }
      
          // Check in the admin collection
          const admin = await db.collection("admin").findOne(searchCriteria);
      
          // Check in the doctors collection
          const doctor = await db.collection("doctors").findOne(searchCriteria);
      
          const patient =await db.collection("patients").findOne(searchCriteria)
          if (!admin && !doctor && !doctor) {
            return returnStatus(res, 404, true, "Not Found");
          }
      
          if (admin) {
            user = admin;
            person = "admin";
          }
          if (doctor) {
            user = doctor;
            person = "doctors";
          }
          if(patient){
            user=patient;
            person="patient"
          }
      
          // Compare password
          bcrypt.compare(password, user.password, (err, result) => {
            if (err || !result) {
              return returnStatus(res, 401, true, "Invalid email, phone number, ID, or password");
            }
            // Generate JWT
            const newjwt = createToken({ email: user.email });
            return returnStatus(res, 200, false, `Welcome ${user.username}`, {
              token: newjwt,
              username: user.username,
              person: person,
            });
          });
        } catch (err) {
          console.log(err);
          return returnStatus(res, 500, true, "Internal server error");
        } finally {
          if (client) {
            await client.close();
          }
        }
      },      
    // ----- Logincheck -------------
    checkifLoggedin : async (req, res) => {
       
        try {
            const db = await getDatabase(); // Connect to MongoDB
            
            // Check if the user is an admin
            var admin = await db.collection('admin').findOne({ email: req.decodedtoken.email });
            if (admin) {
                return returnStatus(res, 200, false, "Ok", {
                    admin: true,
                    email: admin.email,
                    id:admin.id,
                });
            }
    
            // Check if the user is a doctor
            var doctor = await db.collection('doctors').findOne({ email: req.decodedtoken.email });
            if (doctor) {
             
                let base64Image = null;
    
                if (doctor.image.data) {
                    base64Image = doctor.image.data;
                } else {
                    console.warn(`No profile image found for doctor ID: ${doctor.id}`);
                }
    
                // Return doctor information along with profile image if available
                return returnStatus(res, 200, false, "ok", {
                    image: base64Image,
                    doctor: true,
                    id: doctor.id,
                    phone: doctor.phone,
                    email: doctor.email,
                    username: doctor.username,
                    firstName:doctor.firstName,
                    lastName:doctor.lastName,
                });
            }
    
            // If neither admin nor doctor, return unauthorized or not found
            return returnStatus(res, 404, true, "User not found");
    
        } catch (err) {
            console.error(err);
            return returnStatus(res, 500, true, "Internal server error");
        }  
         finally {
            if (client) {
                await client.close();
            }
        }
    },
    // ----- forget password -----
    forgotPassword: async (req, res) => {
        
        try {
            const db = await getDatabase();
            var  user = null;
            var person = "";
            const admin = await db.collection("admin").findOne({
                email: req.body.email
            });
            const doctor = await db.collection("doctors").findOne({
                email: req.body.email
            });
            if (!admin && !doctor) {
                return returnStatus(res, 404, true, "Not Found");
            }
            if (admin) {
                user = admin;
                person = "admin";
            }
            if (doctor) {
                user = doctor;
                person = "doctors";
            }
            const token = createToken({ email: user.email }, '1h');
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: 'medicalportal01@gmail.com',
                    pass: process.env.password,
                }
            });
            const mailOptions = {
                from: 'medicalportal01@gmail.com',
                to: req.body.email,
                subject: 'Reset password',
                text: `http://localhost:5173/resetpassword/${token}`
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                    return returnStatus(res, 401, true, "Error on sending email");
                } else {
                    return returnStatus(res, 200, false, "Email sent", { person });
                }
            });
        } catch (err) {
            console.log(err);
            return returnStatus(res, 500, true, "Internal server error");
        }    
         finally {
            if (client) {
                await client.close();
            }
        }
    },
    // ----- resetPassword -----
    resetPassword: async (req, res) => {
        const token = req.params.token;
        const { password, userType } = req.body;
        if (!userType) {
            return returnStatus(res, 400, true, "UserType parameter is missing.");
        }
        let db;
        try {
            const decoded = jwt.verify(token, process.env.secret);
            const email = decoded.email;
            const hash = await createHash(password);
            db = await getDatabase();
            // Find the user first
            const user = await db.collection(userType).findOne({ email });
            if (!user) {
                return returnStatus(res, 404, true, "User not found.");
            }
            // Update the user's password
            const updateResult = await db.collection(userType).updateOne(
                { email: email },
                { $set: { password: hash } }
            );
            if (updateResult.modifiedCount === 0) {
                return returnStatus(res, 500, true, "Failed to update password.");
            }
            return returnStatus(res, 200, false, "Password Updated");
        } catch (err) {
            console.error("Error resetting password:", err);
            return returnStatus(res, 500, true, "Internal server error");
        } 
        finally {
            if (client) {
                await client.close();
            }
        }
    },
};
module.exports = usersController;
