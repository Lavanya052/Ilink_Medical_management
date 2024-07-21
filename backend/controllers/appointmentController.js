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
console.log(formattedDate)
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
      const appointmentData = {
        time: formattedTime,
        patientName,
        patientId,
        phoneNumber,
        patientStatus: "scheduled",
        doctorStatus: "pending"
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
      console.log("okay 1")
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
      console.log("okay 2")

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
  }
};

module.exports = appointmentController;
