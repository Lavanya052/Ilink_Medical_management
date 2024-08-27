import React, { useState, useEffect } from 'react';
import { makeGETrequest } from '../../../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date()); // Default to today
  const [appointmentsByDate, setAppointmentsByDate] = useState({});
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewByDate, setViewByDate] = useState(true);
  const appointmentsPerPage = 6;
  const [doctorOptions, setDoctorOptions] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');


  const toggleViewMode = () => {
    setViewByDate(!viewByDate);
    setCurrentPage(1);
    setFilteredAppointments([]); 
    setSelectedDoctorId('')

    if (viewByDate) {
      if (doctorOptions.length === 0) {
        fetchAllDoctors(); // Fetch all doctors only if not already fetched
      }
    }
    if (!viewByDate) {
      fetchAppointmentsByDate(); // Fetch all doctors only if not already fetched
    }
    
  };

  const fetchAllDoctors = async () => {
    try {
      const response = await makeGETrequest('http://localhost:5000/doctors/alldoctors');
      const formattedDoctors = response.doctors
        .map(doctor => ({
          id: doctor.id,
          name: `${doctor.firstName} ${doctor.lastName}`, // Assuming full name is a combination of first and last name
        }))
        .sort((a, b) => {
          const idA = parseInt(a.id.substring(1));
          const idB = parseInt(b.id.substring(1));
          return idA - idB;
        });
  
      setDoctorOptions(formattedDoctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      toast.error('Failed to fetch doctors');
    }
  };
  
  useEffect(() => {
    if (viewByDate) {
      fetchAppointmentsByDate();
    }
  }, [selectedDate]);

  const fetchAppointmentsByDate = async () => {
    try {
      const formattedDate = selectedDate.toLocaleDateString('en-CA'); // Use 'en-CA' format
      const response = await makeGETrequest(
        `http://localhost:5000/appointments/allappointments?date=${formattedDate}`,
        localStorage.getItem("token")
      );

      setAppointmentsByDate(response.appointmentsByDate);
      setFilteredAppointments(
        response.appointmentsByDate[formattedDate]?.appointments || []
      );
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchAppointmentsByDoctor = async (doctorId) => {
    try {
      const response = await makeGETrequest(
        `http://localhost:5000/appointments/alldocappointments?doctorId=${doctorId}`,
        localStorage.getItem("token")
      );
  
      console.log('Response:', response); // Inspect the entire response
  
      if (response.error && response.status === 404) {
        console.warn('No appointments found:', response.message);
        setFilteredAppointments([]); // Set an empty array when no appointments are found
      } else if (response.appointments && Array.isArray(response.appointments)) {
        // Transform the appointments array to group by date and list details
        const formattedAppointments = response.appointments.flatMap(appointment => 
          appointment.doctors.flatMap(doctor =>
            doctor.appointments.map((app, index) => ({
              date: appointment.date,
              appointmentNumber: index + 1,
              time: app.time,
              interval: app.interval,
              patientName: app.patientName,
              patientId: app.patientId,
              phoneNumber: app.phoneNumber,
              patientStatus: app.patientStatus,
              doctorStatus: app.doctorStatus,
              image:app.image,
            }))
          )
        );
  
        setFilteredAppointments(formattedAppointments);
        // console.log('Formatted Appointments:', formattedAppointments);
      } else {
        console.error('Unexpected response format:', response);
        setFilteredAppointments([]); // Handle unexpected formats by clearing the appointments
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setFilteredAppointments([]); // Clear appointments if there’s an error during the fetch
    }
  };
  
  const handleDateChange = (e) => {
    const { name, value } = e.target;
    const newDate = new Date(selectedDate);

    if (name === "day") {
      newDate.setDate(value);
    } else if (name === "month") {
      newDate.setMonth(value - 1);
    } else if (name === "year") {
      newDate.setFullYear(value);
    }

    setSelectedDate(newDate);

    // const formattedDate = newDate.toLocaleDateString('en-CA'); // Use consistent date format
    // setFilteredAppointments(
    //   appointmentsByDate[formattedDate]?.appointments || []
    // );
    setCurrentPage(1); // Reset to first page on date change
  };

  const handleDoctorSelect = (e) => {
    const doctorId = e.target.value;
    setSelectedDoctorId(doctorId);
    fetchAppointmentsByDoctor(doctorId);
    
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    const formattedDate = selectedDate.toLocaleDateString('en-CA'); // Use consistent date format
    const filtered = appointmentsByDate[formattedDate]?.appointments.filter(appointment =>
      appointment.doctorName.toLowerCase().includes(e.target.value.toLowerCase())
    ) || [];
    setFilteredAppointments(filtered);
    setCurrentPage(1); // Reset to first page on search
  };

  const formatTime = (time) => {
    const [hour, minute] = time.split(':');
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minute} ${ampm}`;
  };

  const indexOfLastAppointment = currentPage * appointmentsPerPage;
  const indexOfFirstAppointment = indexOfLastAppointment - appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

  const handlePageChange = (pageNumber) => setCurrentPage(pageNumber);

  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <>
      <h1 className="text-3xl text-blue-500 font-bold ml-4 mt-4">Appointments</h1>
      <div className='pl-10 pr-10'>
        <div className="flex justify-between items-center mb-5 mt-5">
        {
            viewByDate && (
              <>
                <div className="flex">
                  <select name="day" value={selectedDate.getDate()} onChange={handleDateChange} className="mr-2 p-2 border rounded">
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                  <select name="month" value={selectedDate.getMonth() + 1} onChange={handleDateChange} className="mr-2 p-2 border rounded">
                    {months.map(month => (
                      <option key={month} value={month}>{month}</option>
                    ))}
                  </select>
                  <select name="year" value={selectedDate.getFullYear()} onChange={handleDateChange} className="p-2 border rounded">
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="justify-end">
                  <input
                    type="text"
                    placeholder="Search by doctor name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="p-2 border rounded w-80"
                  />
                </div>
              </>
            )
          }
          {!viewByDate && (
            <>
              <select
                value={selectedDoctorId}
                onChange={handleDoctorSelect}
                className="p-2 border rounded"
              >
                <option value="">Select Doctor</option>
                {doctorOptions.map(doctor => (
                  <option key={doctor.id} value={doctor.id}>
                    {doctor.id} - {doctor.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <button
            onClick={toggleViewMode}
            className="px-4 py-2 rounded bg-blue-500 text-white ml-4"
          >
            {viewByDate ? "View By Doctor" : "View By Date"}
          </button>


        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="table-auto w-full text-center bg-white ">
            <thead>
              <tr className="bg-sky-300">
              {!viewByDate && <th className="px-4 py-2">Date</th>}
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Phone</th>
                {viewByDate &&<th className="px-4 py-2">Doctor</th>}
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.length > 0 ? (
                currentAppointments.map((appointment, index) => (
                  <>
                  {/* When viewByDate is true */}
                  {viewByDate && (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 flex justify-center items-center">
                        <img
                          src={`data:${appointment.image.contentType};base64,${appointment.image.data}`}
                          alt="Patient"
                          className="w-10 h-10 rounded-full"
                        />
                      </td>
                      <td className="px-4 py-2">{appointment.patientName}</td>
                      <td className="px-4 py-2">{formatTime(appointment.time)}</td>
                      <td className="px-4 py-2">{appointment.phoneNumber}</td>
                      <td className="px-4 py-2">Dr. {appointment.doctorName}</td>
                      <td className="px-4 py-2">
                        <button
                          className={`px-4 py-2 rounded ${
                            appointment.doctorStatus === 'pending' ? 'bg-yellow-500 text-white' :
                            appointment.doctorStatus === 'accepted' ? 'bg-green-500 text-white' :
                            'bg-red-500 text-white'
                          }`}
                        >
                          {appointment.doctorStatus}
                        </button>
                      </td>
                    </tr>
                  )}
              
                  {/* When viewByDate is false */}
                  {!viewByDate && (
                   <tr key={index} className="border-t">
                      <td className="px-4 py-2">{appointment.date}</td>
                      <td className="px-4 py-2 flex justify-center items-center">
                        <img
                          src={`data:${appointment.image.contentType};base64,${appointment.image.data}`}
                          alt="Patient"
                          className="w-10 h-10 rounded-full"
                        />
                      </td>
                      <td className="px-4 py-2">{appointment.patientName}</td>
                      <td className="px-4 py-2">{formatTime(appointment.time)}</td>
                      <td className="px-4 py-2">{appointment.phoneNumber}</td>
                      <td className="px-4 py-2">
                        <button
                          className={`px-4 py-2 rounded ${
                            appointment.doctorStatus === 'pending' ? 'bg-yellow-500 text-white' :
                            appointment.doctorStatus === 'accepted' ? 'bg-green-500 text-white' :
                            'bg-red-500 text-white'
                          }`}
                        >
                          {appointment.doctorStatus}
                        </button>
                      </td>
                    </tr>
                  )}
                </>
                ))
              ) : (
                <tr>
                 {viewByDate && ( <td colSpan="6" className="px-4 py-2 text-center">No appointments for this date.</td>)}
                 {!viewByDate && ( <td colSpan="6" className="px-4 py-2 text-center">No appointments for this Doctor.</td>)}
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages >0 && (
          <>
           <div className="mt-4 flex justify-between items-center">
          <div className="text-sm ml-2">
            Showing {indexOfFirstAppointment + 1} to {Math.min(indexOfLastAppointment, filteredAppointments.length)} of {filteredAppointments.length} appointments
          </div>
          <div className="flex space-x-2">
          <div className="mt-4 flex justify-center">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-4 py-2 mx-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          </div>
        </div>
          </>
        )}
        <ToastContainer />
      </div>
    </>
  );
};

export default Appointments;