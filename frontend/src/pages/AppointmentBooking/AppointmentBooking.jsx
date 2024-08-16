import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import { useLocation, useNavigate } from 'react-router-dom';
import { makeGETrequest,makePOSTrequest } from "../../utils/api";
import 'react-calendar/dist/Calendar.css';
import CustomForm from "../../components/CustomForm/CustomForm";
import Button from "../../components/Button/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AppointmentBooking.css"

const AppointmentForm = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [speciality, setSpeciality] = useState("");
  const [doctor, setDoctor] = useState({ id: "", name: "" });
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [timeSlot, setTimeSlot] = useState("");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [slots, setSlots] = useState([]);
  const [patients, setPatients] = useState([]);
  const [patientName, setPatientName] = useState("");
  const [patientID, setPatientID] = useState("");
  const [patientPhone, setPatientPhone] = useState("");
  const [message, setMessage] = useState("")
  const location = useLocation();
  const navigate = useNavigate();
  const { patientId, patientFName, patientLName,patientphone } = location.state || { patientId: '', patientFName: '', patientLName: '',patientphone:'' };

  const specialtyOptions = [
    { value: "cardiology", label: "Cardiology" },
    { value: "neurology", label: "Neurology" },
    { value: "dermatology", label: "Dermatology" },
    { value: "orthopedics", label: "Orthopedics" },
  ];

  const handleDateChange = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set the time to midnight to compare only the date

    if (date < today) {
      toast.error('You cannot select a past date.');
    } else {
      setSelectedDate(date);
    }
    let dateOnly;

    if (typeof selectedDate === 'string') {
      dateOnly = selectedDate.split('T')[0];
    } else if (selectedDate instanceof Date) {
      const year = selectedDate.getFullYear();
      const month = ('0' + (selectedDate.getMonth() + 1)).slice(-2);
      const day = ('0' + selectedDate.getDate()).slice(-2);
      dateOnly = `${year}-${month}-${day}`;
    } else {
      console.error('Unexpected format for selectedDate:', selectedDate);
      return;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //  console.log(
    //   selectedDate.toISOString(),
    //   selectedTimeSlot,
    //   doctor.id,
    //   doctor.name,
    //   patientName ? patientName : `${patientFName} ${patientLName}`,
    //   speciality,
    //   patientId ? patientId : patientID,
    //   patientPhone ? patientPhone : patientphone
    // );
    try {
      const res = await makePOSTrequest(
        `http://localhost:5000/appointments/bookappointment`,
        {
          date: selectedDate.toISOString(),
        time: selectedTimeSlot,
        doctorId: doctor.id,
        doctorName: doctor.name,
        patientName: patientName || `${patientFName} ${patientLName}`,
        speciality,
        patientId: patientId || patientID,
        phoneNumber: patientPhone || patientphone,
        },
        localStorage.getItem("token")
      );

      console.log(res)
      if (res.status === 201) {
        toast.success(res.message);
        setTimeout(() => {
          navigate("/searchPatient");
        }, 2000);
      } else {
        toast.error(res.message);
        setTimeout(() => {
          navigate("/appointmentbooking");
        }, 2000);
      }
    } catch (error) {
      console.error(error);
    }
  };


  const fetchDoctors = async (speciality) => {
    try {
      const res = await makeGETrequest(
        `http://localhost:5000/doctors/getspeciality/${speciality}`,
        localStorage.getItem("token")
      );
      return res.doctors;
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch doctors');
      return [];
    }
  };

  useEffect(() => {
    const getDoctors = async () => {
      if (speciality) {
        const doctors = await fetchDoctors(speciality);
        const transformedDoctors = doctors.map((doctor) => ({
          value: doctor.id,
          label: doctor.name,
        }));
        setDoctorOptions(transformedDoctors);
        setDoctor("");
      }
    };
    getDoctors();
  }, [speciality]);

  const fetchPatients = async (patientName) => {
    try {
      const res = await makeGETrequest(
        `http://localhost:5000/patients/fetchPatients/${patientName}`,
        localStorage.getItem("token")
      );
      return res.patients;
    } catch (error) {
      return [];
    }
  };

  useEffect(() => {
    const getPatients = async () => {
      if (patientName.trim() !== "") {
        const firstName = patientName.trim().split(' ')[0];
        try {
          const patients = await fetchPatients(firstName);
          const transformedPatients = patients.map((patient) => ({
            value: patient.id,
            label: `${patient.id} ${patient.firstName} ${patient.lastName}`,
            phone: patient.phone,
          }));
          setPatients(transformedPatients);
        } catch {
          setPatients([]);
          setPatientID("");
          setPatientPhone("");
        }
      }
    };
    getPatients();
  }, [patientName]);

  const handlePatientSelect = (selectedPatient) => {
    setPatientName(selectedPatient.label.replace(selectedPatient.value, ''));
    setPatientID(selectedPatient.value);
    setPatientPhone(selectedPatient.phone);
    setPatients([]);
  };

  const fetchTimeSlots = async (doctorId, date) => {
    try {
      const res = await makeGETrequest(
        `http://localhost:5000/appointments/timeslots?doctorId=${doctorId}&date=${date}`,
        localStorage.getItem("token")
      );
      if (res.status === 200 && res.timeSlots.length > 0) {
        // console.log(res)
        return res.timeSlots;
      } else {
        return [];
      }
    } catch (error) {
      // console.error(error);
      return [];
    }
  };

  useEffect(() => {
    const getTimeSlots = async () => {
      if (doctor.id && selectedDate) {
        let dateOnly;
        if (typeof selectedDate === 'string') {
          dateOnly = selectedDate.split('T')[0];
        } else if (selectedDate instanceof Date) {
          const year = selectedDate.getFullYear();
          const month = ('0' + (selectedDate.getMonth() + 1)).slice(-2);
          const day = ('0' + selectedDate.getDate()).slice(-2);
          dateOnly = `${year}-${month}-${day}`;
        } else {
          console.error('Unexpected format for selectedDate:', selectedDate);
          return;
        }
        try {
          const slot = await fetchTimeSlots(doctor.id, dateOnly);
          const mergedSlots = [].concat(...slot);
          mergedSlots.sort((a, b) => new Date(`2000-01-01T${a.startTime}:00`) - new Date(`2000-01-01T${b.startTime}:00`));
          setSlots(mergedSlots);
        } catch (error) {
          setSlots([]);
          console.error('Error fetching time slots:', error);
        }
      }
    };
    getTimeSlots();
  }, [doctor.id, selectedDate]);

  const generateTimeSlots = (start, end, interval) => {
    const startTime = new Date(`2000-01-01T${start}:00`);
    const endTime = new Date(`2000-01-01T${end}:00`);
    const intervalMinutes = parseInt(interval);
    const timeSlots = [];
    while (startTime < endTime) {
      const startHours = startTime.getHours() % 12 || 12;
      const startMinutes = startTime.getMinutes().toString().padStart(2, '0');
      const startTime12hr = `${startHours}:${startMinutes} ${startTime.getHours() >= 12 ? 'PM' : 'AM'}`;
      startTime.setTime(startTime.getTime() + intervalMinutes * 60000);
      const endHours = startTime.getHours() % 12 || 12;
      const endMinutes = startTime.getMinutes().toString().padStart(2, '0');
      const endTime12hr = `${endHours}:${endMinutes} ${startTime.getHours() >= 12 ? 'PM' : 'AM'}`;
      timeSlots.push(`${startTime12hr}`);
    }
    return timeSlots;
  };
  function convertTo12Hour(time24) {
    const [hours, minutes] = time24.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = (hours % 12) || 12;
    return `${hour12}:${minutes} ${period}`;
  }
  function convertTo24Hour(time12hr) {
    const [time, period] = time12hr.split(' ');
    let [hours, minutes] = time.split(':');
  
    hours = parseInt(hours);
    minutes = parseInt(minutes);
  
    if (period === 'PM' && hours !== 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
  
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  

  // Form submit

 
  return (
    <div className={`appointment-page md:min-h-full`}>
      <h1 className="text-3xl font-bold text-blue-600 ml-8 mt-4 mb-6">Make An Appointment</h1>
      <div className="flex flex-col md:flex-row p-6">
        <div className="w-full md:w-1/3 mb-8 md:mb-0 mr-3">
          <h1 className="text-blue-600 text-bold text-xl ml-1 mb-3 font-semibold">Select a Date</h1>
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            className="custom-calendar"
            
          />
        </div>
        <div className="w-full md:w-2/3 md:ml-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <h1 className="text-blue-600 text-bold text-xl font-semibold">Select Speciality & Doctor</h1>
            <div className="bg-white rounded-xl shadow-md p-3">
              <div className="grid md:grid-cols-3 grid-cols-2">
                {patientId ? (
                  <>
                    <div className="ml-2 mr-2">
                      <CustomForm.Input
                        value={patientId}
                        placeholder="Patient Id"
                      />
                    </div>
                    <div className="ml-2 mr-2">
                      <CustomForm.Input
                        value={`${patientFName} ${patientLName}`.trim()}
                        placeholder="Patient Name"
                      />
                    </div>
                    <div className="ml-2 mr-2">
                      <CustomForm.Phone
                        value={patientphone}
                        placeholder="Patient Phone"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="ml-2 mr-2">
                      <CustomForm.Input
                        value={patientName.trim()}
                        onChange={(e) => { setPatientName(e.target.value) }}
                        placeholder="Patient Name"
                      />
                      {patients.length > 0 && (
                        <div className="absolute mt-1 w-fit rounded-md bg-white shadow-lg z-10 p-3">
                          {patients.map((patient) => (
                            <div
                              key={patient.value}
                              onClick={() => handlePatientSelect(patient)}
                            >
                              {patient.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="ml-2 mr-2">
                      <CustomForm.Input
                        value={patientID}
                        placeholder="Patient Id"
                      />
                    </div>
                    <div className="ml-2 mr-2">
                      <CustomForm.Phone
                        value={patientPhone}
                        placeholder="Patient Phone"
                      />
                    </div>
                  </>
                )}
                <div className="ml-2 mr-2">
                  <CustomForm.Options
                    value={speciality || ""}
                    onChange={(e) => {
                      setSpeciality(e.target.value);
                      setSlots([]);
                    }}
                    placeholder="Speciality"
                    Options={specialtyOptions}
                  />
                </div>
                <div className="ml-2 mr-2">
                  <CustomForm.Options
                    value={doctor.id || ""}
                    onChange={(e) => {
                      const selected = doctorOptions.find(d => d.value === e.target.value);
                      setDoctor({ id: e.target.value, name: selected ? selected.label : '' });
                    }}
                    placeholder="Doctor"
                    Options={doctorOptions}
                  />
                </div>
              </div>
            </div>
            <h1 className="text-blue-600 text-bold text-xl ml-1 font-semibold">Select Time Slot</h1>
            <div className="bg-white pl-5 pt-5 pr-5 rounded-xl shadow-md">
              <div className="mb-6">
                <p className="text-xl font-medium text-blue-500 mb-5">{selectedDate.toDateString()}</p>
                {slots && slots.length > 0 ? (
                  slots.some(slot => slot.notAvailable) ? (
                    <p key={doctor.id} className="flex items-center text-semibold text-black text-lg">Doctor not available for that selected date</p>
                  ) : (
                    <div>
                      {slots.map((slot, slotIndex) => {
                        const startTime = convertTo12Hour(slot.startTime);
                        const endTime = convertTo12Hour(slot.endTime);

                        return (
                          <div key={slotIndex} className=" mb-4">
                            <h3 className="text-lg font-semibold mb-4 items-left text-left">{startTime} - {endTime}</h3>
                            <div className="grid md:grid-cols-4 grid-cols-3 gap-4">
                              {generateTimeSlots(slot.startTime, slot.endTime, slot.interval).map((time, timeIndex) => (
                                <label
                                key={`${slotIndex}-${timeIndex}`}
                                className={`flex justify-center rounded-lg p-2 ${
                                  selectedTimeSlot === time
                                    ? 'bg-blue-500 text-white'
                                    :slot.booked.some(bookedSlot => bookedSlot.time === convertTo24Hour(time))  
                                    ? 'bg-red-300 text-red-700 text-lg cursor-not-allowed'
                                    : 'bg-green-200 text-green-700 text-lg hover:bg-green-300 cursor-pointer'
                                }`}
                              >

                                  <input
                                    type="button"
                                    name="timeSlot"
                                    value={time}
                                    onClick={(e) => {
                                      setSelectedTimeSlot(e.target.value);
                                    }}
                                    className="form-button justify-center bg-transparent focus:ring-blue-400"
                                    id={`time-slot-${timeIndex}`}
                                     disabled={slot.booked.some(bookedSlot => bookedSlot.time === convertTo24Hour(time))}
                                    
                                  />
                                </label>

                              ))}
                            </div>

                          </div>

                        );
                      })}
                    </div>
                  )
                ) : (
                  doctor.id ? (
                    <p className="flex items-center text-semibold text-black text-lg" >No available time slots for selected date and doctor.</p>
                  ) : (
                    <p className="flex items-center text-semibold text-black text-lg">Select a doctor first</p>
                  )
                )}

              </div>
              <div className="flex justify-end pr-3 pb-3">
                <Button value={"Submit"} type="submit" />
              </div>
            </div>
          </form>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
};

export default AppointmentForm;
