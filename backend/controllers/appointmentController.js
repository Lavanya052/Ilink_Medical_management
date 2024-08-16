const { getDatabase } = require("../helpers/connectDB");
const returnStatus = require("../helpers/returnStatus");
const moment = require('moment');

const appointmentController = {
  getDoctorAvailability: async (req, res) => {
    try {
      const db = await getDatabase();
      const { doctorId, date } = req.query;

      if (!doctorId || !date) {
        return returnStatus(res, 400, true, 'Doctor ID and date are required');
      }

      const result = await db.collection("availability").findOne(
        { doctorId: doctorId },
        { projection: { _id: 0, doctorId: 1, dates: 1 } } // Fetch only relevant fields
      );

      if (!result || !result.dates || result.dates.length === 0) {
        return returnStatus(res, 200, false, 'No time slots found', []);
      }

      const availabilityForDate = result.dates
        .filter(dateEntry => dateEntry.date === date)
        .flatMap(dateEntry => dateEntry.availability)
      // .filter(slot => !slot.notAvailable && slot.startTime !== "Invalid date" && slot.endTime !== "Invalid date");

      if (availabilityForDate.length === 0) {
        return returnStatus(res, 200, false, 'No time slots found for the given date', []);
      }

      const timeSlots = availabilityForDate.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        interval: slot.interval,
        notAvailable: slot.notAvailable,
        booked: slot.booked || []
      }));

      return returnStatus(res, 200, false, 'Time slots found', { timeSlots: timeSlots });
    } catch (error) {
      console.error(error);
      return returnStatus(res, 500, true, 'Failed to fetch time slots');
    }
  },



  bookAppointment: async (req, res) => {
    const { date, time, doctorId, doctorName, patientName, speciality, patientId, phoneNumber } = req.body;

    try {
      if (!date || !time || !doctorId || !doctorName || !patientName || !speciality || !patientId || !phoneNumber) {
        return returnStatus(res, 400, true, 'Missing required fields');
      }

      const formattedTime = moment(time, 'hh:mm A').format('HH:mm');
      const formattedDate = moment(date).format('YYYY-MM-DD');
      const db = await getDatabase();

      const existingPatientAppointment = await db.collection("availability").findOne({
        doctorId,
        "dates": {
          $elemMatch: {
            date: formattedDate,
          }
        },
        "dates.availability.booked": {
          $elemMatch: {
            date: formattedDate,
            patientId: patientId
          }
        }

      });

      //console.log(existingPatientAppointment)

    
      if (existingPatientAppointment) {
        return returnStatus(res, 400, true, 'Patient already has an appointment on this day');
      }
      
      const result = await db.collection('availability').findOne(
        { 
            doctorId, 
            "dates": {
          $elemMatch: {
            date: formattedDate,
          }
        },
        "dates.availability": {
          $elemMatch: {
            startTime: { $lte: formattedTime },
            endTime: { $gte: formattedTime }
        }
        }
        }, 
        { 
            projection: {  _id: 0,'dates.$': 1 } 
        }
    );
    // console.log(result)
    const interval = result?.dates?.[0]?.availability?.find(
      avail => avail.startTime <= formattedTime && avail.endTime >= formattedTime
  )?.interval || 'Interval not found';

  const patient = await db.collection("patients").findOne({id:patientId},{projection: {_id:0,"image.$":1}})
  // console.log(patient)
      const appointmentData = {
        time: formattedTime,
        interval,
        patientName,
        patientId,
        phoneNumber,
        patientStatus: "scheduled",
        doctorStatus: "pending",
        image:patient.image
      };

      // Update the doctor's appointments
      const existingDate = await db.collection("appointments").findOne({ date: formattedDate });

      if (existingDate) {
        const existingDoctor = existingDate.doctors.find(doc => doc.doctorId === doctorId);
        if (existingDoctor) {
          await db.collection("appointments").updateOne(
            { date: formattedDate, "doctors.doctorId": doctorId },
            { $push: { "doctors.$.appointments": appointmentData } }
          );
        }
        else {
          await db.collection("appointments").updateOne(
            { date: formattedDate },
            {
              $push: {
                doctors: {
                  doctorId,
                  doctorName,
                  appointments: [appointmentData]
                }
              }
            }
          );
        }


      } else {
        const newDoctorAppointment = {
          date: formattedDate,
          doctors: [
            {
              doctorId,
              doctorName,
              appointments: [appointmentData]
            }
          ]
        };
        await db.collection("appointments").insertOne(newDoctorAppointment);
      }
      // console.log("okay 1")
      const availabilityUpdateResult = await db.collection("availability").updateOne(
        {
          doctorId,
          "dates.date": formattedDate,
          "dates.availability.startTime": { $lte: formattedTime },
          "dates.availability.endTime": { $gte: formattedTime },
          "dates.availability.date": formattedDate,
          $or: [
            { "dates.availability.booked": { $size: 0 } },
            { "dates.availability.booked.time": { $ne: formattedTime } }
          ]
        },
        {
          $push: {
            "dates.$[dateElem].availability.$[availElem].booked": {
              time: formattedTime,
              date: formattedDate,
              patientId: patientId
            }
          }
        },
        {
          arrayFilters: [
            { "dateElem.date": formattedDate },
            { "availElem.date": formattedDate, "availElem.startTime": { $lte: formattedTime }, "availElem.endTime": { $gte: formattedTime } }
          ]
        }
      );
      // console.log("okay 2")

      if (availabilityUpdateResult.modifiedCount === 0) {
        throw new Error(error);
      }


      return returnStatus(res, 201, false, 'Appointment booked successfully');
    } catch (error) {
      console.error(error);
      return returnStatus(res, 500, true, 'Failed to book appointment error');
    }
  },

  getAppointments: async (req, res) => {
    const { date } = req.query;

    try {
      if (!date) {
        return returnStatus(res, 400, true, 'Date is required');
      }

      const formattedDate = moment(date).format('YYYY-MM-DD');

      const db = await getDatabase();
      const appointments = await db.collection("appointments").findOne({ date: formattedDate }, { projection: { _id: 0 } });

      if (!appointments) {
        return returnStatus(res, 404, true, 'No appointments found for the given date');
      }

      return returnStatus(res, 200, false, 'Appointments found', { appointments });
    } catch (error) {
      console.error(error);
      return returnStatus(res, 500, true, 'Failed to fetch appointments');
    }
  },

getDoctorAppointments: async (req, res) => {
    const { date, doctorId } = req.query;
  
    // console.log(date, doctorId); // Debugging line to ensure the route is hit
  
    try {
      if (!date) {
        return returnStatus(res, 400, true, 'Date is required');
      }
  
      if (!doctorId) {
        return returnStatus(res, 400, true, 'Doctor ID is required');
      }
  
      const formattedDate = moment(date).format('YYYY-MM-DD');
  
      const db = await getDatabase();
      const appointmentsDocument = await db.collection("appointments").findOne(
        { date: formattedDate, "doctors.doctorId": doctorId },
        { projection: { _id: 0, "doctors": 1 } }
      );
  
      if (!appointmentsDocument || appointmentsDocument.doctors.length === 0) {
        return returnStatus(res, 404, true, 'No appointments found for the given date and doctor');
      }
  
      const doctorAppointments = appointmentsDocument.doctors.find(doctor => doctor.doctorId === doctorId);

      if (!doctorAppointments) {
        return returnStatus(res, 404, true, 'No appointments found for the given doctor ID');
      }
  
      return returnStatus(res, 200, false, 'Appointments found', { appointments: doctorAppointments });
    } catch (error) {
      console.error(error);
      return returnStatus(res, 500, true, 'Failed to fetch appointments');
    }
  },

  // Assuming you are using Mongoose for MongoDB operations

  doctorStatus: async (req, res) => {
    const { doctorId, status, startTime, date } = req.body;

    try {
      const db = await getDatabase();
        const updatedAppointment = await db.collection("appointments").updateOne(
          {
              "date": date,
              "doctors.doctorId": doctorId,
              "doctors.appointments.time": startTime
          },
          {
              $set: {
                  "doctors.$[doctor].appointments.$[appointment].doctorStatus": status
              }
          },
          {
              arrayFilters: [
                  { "doctor.doctorId": doctorId },
                  { "appointment.time": startTime }
              ]
          }
      );

        if (updatedAppointment.nModified === 0) {
            return res.status(404).json({ message: "Appointment not found or no change made." });
        }

        res.status(200).json({ message: "Appointment status updated successfully." });
    } catch (error) {
        console.error("Error updating appointment status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
},

  getPendingDoctorAppointments: async (req, res) => {
    const { doctorId } = req.query;

    try {
      if (!doctorId) {
        return returnStatus(res, 400, true, 'Doctor ID is required');
      }

      const db = await getDatabase();
      const appointmentsDocuments = await db.collection("appointments").find(
        { "doctors.doctorId": doctorId },
        { projection: { _id: 0, "date": 1, "doctors": 1 } }
      ).toArray();

      if (!appointmentsDocuments || appointmentsDocuments.length === 0) {
        return returnStatus(res, 404, true, 'No appointments found for the given doctor ID');
      }

      let pendingAppointments = [];

      appointmentsDocuments.forEach(doc => {
        const doctorAppointments = doc.doctors.find(doctor => doctor.doctorId === doctorId);
        if (doctorAppointments) {
          const doctorPendingAppointments = doctorAppointments.appointments
            .filter(appointment => appointment.doctorStatus === 'pending')
            .map(appointment => ({
              ...appointment,
              date: doc.date // Include the date for each appointment
            }));
          pendingAppointments = pendingAppointments.concat(doctorPendingAppointments);
        }
      });

      if (pendingAppointments.length === 0) {
        return returnStatus(res, 404, true, 'No pending appointments found for the given doctor ID');
      }

      return returnStatus(res, 200, false, 'Pending appointments found', { appointments: pendingAppointments });
    } catch (error) {
      console.error(error);
      return returnStatus(res, 500, true, 'Failed to fetch pending appointments');
    }
  },

  getAllAppointments: async (req, res) => {
    try {
      const db = await getDatabase();
      const appointmentsDocuments = await db.collection("appointments").find({}, { projection: { _id: 0, date: 1, doctors: 1 } }).toArray();
  
      if (!appointmentsDocuments || appointmentsDocuments.length === 0) {
        return returnStatus(res, 404, true, 'No appointments found');
      }
  
      let totalAppointmentsCount = 0;
      const appointmentsByDate = {};
  
      appointmentsDocuments.forEach(doc => {
        if (!appointmentsByDate[doc.date]) {
          appointmentsByDate[doc.date] = {
            date: doc.date,
            count: 0,
            appointments: []
          };
        }
        doc.doctors.forEach(doctor => {
          const appointmentsCount = doctor.appointments.length;
          totalAppointmentsCount += appointmentsCount;
          appointmentsByDate[doc.date].count += appointmentsCount;
          appointmentsByDate[doc.date].appointments.push(...doctor.appointments.map(appointment => ({
            ...appointment,
            doctorId: doctor.doctorId,
            doctorName: doctor.doctorName,
          })));
        });
      });
  
      return returnStatus(res, 200, false, 'Appointments found', { totalAppointmentsCount, appointmentsByDate });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return returnStatus(res, 500, true, 'An error occurred while fetching appointments');
    }
  },  

  getAllDoctorAppointments: async (req, res) => {
    const { doctorId } = req.query;
  
    // console.log(doctorId);
    try {
      if (!doctorId) {
        return returnStatus(res, 400, true, 'Doctor ID is required');
      }
  
      const db = await getDatabase();
      const appointmentsDocuments = await db.collection("appointments").find(
        { "doctors.doctorId": doctorId },
        { projection: { _id: 0, date: 1, "doctors.$": 1 } } // using $ to project only matching subdocument in array
      ).toArray();
  
      if (!appointmentsDocuments || appointmentsDocuments.length === 0) {
        return returnStatus(res, 404, true, 'No appointments found for the given doctor ID');
      }
  
      return returnStatus(res, 200, false, 'Appointments found', { appointments: appointmentsDocuments });
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return returnStatus(res, 500, true, 'An error occurred while fetching appointments');
    }
  },
  
};

module.exports = appointmentController;
