import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { makeGETrequest } from '../../utils/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaCheck, FaClock } from 'react-icons/fa';
import { ImCross } from 'react-icons/im';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewByDate, setViewByDate] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all'); // Status filter state
  const appointmentsPerPage = 6;

  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await makeGETrequest(`http://localhost:5000/appointments/alldocappointments?doctorId=${user.id}`, localStorage.getItem("token"));
        setAppointments(res.appointments || []);
      } catch (error) {
        toast.error("Error fetching appointments");
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    if (user.username) {
      fetchAppointments();
    }
  }, [user, navigate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const filterAppointmentsByDate = (appointments, date) => {
    return date ? appointments.filter(appointment => appointment.date === date) : appointments;
  };

  const filterAppointmentsBySearch = (appointments) => {
    const normalizedSearchTerm = searchTerm.toLowerCase().trim();

    return appointments.flatMap(appointment =>
      appointment.doctors.flatMap(doctor =>
        doctor.appointments.filter(app =>
          app.patientName.toLowerCase().includes(normalizedSearchTerm)
        ).map(filteredApp => ({
          ...filteredApp,
          date: appointment.date
        }))
      )
    );
  };

  const filterAppointmentsByStatus = (appointments, status) => {
    return status === 'all' ? appointments : appointments.filter(app => app.doctorStatus === status);
  };

  const sortAppointmentsByDateAndTime = (appointments) => {
    return appointments.sort((a, b) => {
      const dateComparison = new Date(a.date) - new Date(b.date);
      if (dateComparison !== 0) {
        return dateComparison;
      }
      return new Date(`1970-01-01T${a.time}:00Z`) - new Date(`1970-01-01T${b.time}:00Z`);
    });
  };

  const convertTo12HourFormat = (time) => {
    let [hours, minutes] = time.split(':');
    hours = parseInt(hours, 10);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    minutes = minutes.padStart(2, '0');
    return `${hours}:${minutes} ${ampm}`;
  };

  // Apply filters and sort
  const filteredByDate = filterAppointmentsByDate(appointments, viewByDate ? selectedDate : null);
  const filteredBySearch = filterAppointmentsBySearch(filteredByDate);
  const filteredByStatus = filterAppointmentsByStatus(filteredBySearch, statusFilter);
  const sortedAppointments = sortAppointmentsByDateAndTime(filteredByStatus);

  const totalPages = Math.ceil(sortedAppointments.length / appointmentsPerPage);
  const currentAppointments = sortedAppointments.slice(
    (currentPage - 1) * appointmentsPerPage,
    currentPage * appointmentsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const toggleViewMode = () => {
    setViewByDate(!viewByDate);
    setCurrentPage(1);
  };

  if (loading) {
    return <p className="text-center mt-4">Loading...</p>;
  }

  if (error) {
    return <p className="text-center mt-4 text-red-500">Error: {error.message}</p>;
  }

  // Status selector data
  const statusOptions = [
    { label: 'Appointments', icon: <FaUser className="text-white" />, status: 'all', iconBgColor: 'bg-blue-500' },
    { label: 'Accepted', icon: <FaCheck className="text-white" />, status: 'accepted', iconBgColor: 'bg-green-500' },
    { label: 'Rejected', icon: <ImCross className="text-white" />, status: 'rejected', iconBgColor: 'bg-red-500' },
    { label: 'Pending', icon: <FaClock className="text-white" />, status: 'pending', iconBgColor: 'bg-yellow-500' },
  ];

  return (
    <div className="p-4">
      <h1 className="text-3xl text-blue-500 font-bold ml-4 mt-4">Appointments</h1>
      <div className='pl-10 pr-10'>
        <div className="flex justify-between items-center mb-5 mt-5">
          {viewByDate && (
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="p-2 border rounded"
            />
          )}
          {!viewByDate && <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by patient name"
            className="p-2 border rounded"
          />}
          <select
            value={statusFilter}
            onChange={(e) => handleStatusFilterChange(e.target.value)}
            className="p-2 border rounded"
          >
            {statusOptions.map(option => (
              <option key={option.status} value={option.status}>
                {option.label}
              </option>
            ))}
          </select>
          <button 
            onClick={toggleViewMode}
            className="px-4 py-2 rounded bg-blue-500 text-white ml-4"
          >
            {viewByDate ? "View All" : "View By Date"}
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg">
          <table className="table-auto w-full text-center bg-white">
            <thead>
              <tr className="bg-sky-300">
                <th className="px-4 py-2">Image</th>
                <th className="px-4 py-2">Patient Name</th>
                {!viewByDate && <th className="px-4 py-2">Date</th>}
                <th className="px-4 py-2">Time</th>
                <th className="px-4 py-2">Phone</th>
                <th className="px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentAppointments.length > 0 ? (
                currentAppointments.map((docAppointment, index) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2 flex justify-center items-center">
                      {docAppointment.image ? (
                        <img src={`data:${docAppointment.image.contentType};base64,${docAppointment.image.data}`} alt="Patient" className="w-10 h-10 rounded-full" />
                      ) : (
                        <span className="w-10 h-10 rounded-full bg-gray-200 flex justify-center items-center">
                          N/A
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2">{docAppointment.patientName}</td>
                    {!viewByDate && <td className="px-4 py-2">{docAppointment.date}</td>}
                    <td className="px-4 py-2">{convertTo12HourFormat(docAppointment.time)}</td>
                    <td className="px-4 py-2">{docAppointment.phoneNumber}</td>
                    <td className="px-4 py-2">
                      <button className={`px-4 py-2 rounded ${docAppointment.doctorStatus === 'pending' ? 'bg-yellow-500 text-white' :
                          docAppointment.doctorStatus === 'accepted' ? 'bg-green-500 text-white' :
                            'bg-red-500 text-white'
                        }`}>
                        {docAppointment.doctorStatus}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-2 text-center">
                    No appointments found{viewByDate && ` for ${selectedDate}`}.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
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
        )}
        <ToastContainer />
      </div>
    </div>
  );
};

export default DoctorAppointments;
