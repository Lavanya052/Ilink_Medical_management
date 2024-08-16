import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makeGETrequest } from "../../utils/api";
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

const AppointmentsTable = ({ appointments, userRole }) => {
  const sortedAppointments = [];

  if (userRole === "admin") {
    appointments?.doctors?.forEach(doctor => {
      doctor.appointments.forEach(appointment => {
        sortedAppointments.push({
          ...appointment,
          doctorId: doctor.doctorId,
          doctorName: doctor.doctorName
        });
      });
    });
  } else if (userRole === "doctors") {
    appointments?.appointments?.forEach(appointment => {
      if (appointment.doctorStatus === "accepted") {
        sortedAppointments.push({
          ...appointment,
          doctorId: appointments.doctorId,
          doctorName: appointments.doctorName
        });
      }
    });
  }

  sortedAppointments.sort((a, b) => new Date(`1970-01-01T${a.time}:00Z`) - new Date(`1970-01-01T${b.time}:00Z`));

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return { className: 'text-yellow-500', formattedStatus: 'Pending' };
      case 'scheduled':
        return { className: 'text-blue-700', formattedStatus: 'Scheduled' };
      case 'completed':
        return { className: 'text-green-800', formattedStatus: 'Completed' };
      case 'accepted':
        return { className: 'text-green-400', formattedStatus: 'Accepted' };
      case 'rejected':
        return { className: 'text-red-400', formattedStatus: 'Rejected' };
      default:
        return { className: '', formattedStatus: '' };
    }
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return format(date, 'h:mm a'); // 12-hour format with AM/PM
  };
  const getImageSrc = (image) => {
    return `data:${image.contentType};base64,${image.data}`;
  };

  return (
    <div className="overflow-x-auto">
      {sortedAppointments.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-center font-medium text-gray-500 uppercase tracking-wider">Time</th>
              {userRole === 'admin' && (
                <>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Image</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Status</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Status</th>
                </>
              )}
              {userRole === 'doctors' && (
                <>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Image</th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-center">
            {sortedAppointments.map((appointment, index) => (
              <tr key={index}>
                <td className="px-4 py-2 whitespace-nowrap">{format(new Date(), 'dd-MM-yyyy')}</td>
                <td className="px-4 py-2 whitespace-nowrap">{formatTime(appointment.time)}</td>
                {userRole === 'admin' && (
                  <>
                   <td className="px-4 py-2 whitespace-nowrap  flex justify-center items-center">
                      <img src={getImageSrc(appointment.image)} alt={appointment.patientName} className="w-12 h-12 rounded-full object-cover" />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{appointment.patientName}</td>
                    <td className="px-4 py-2 whitespace-nowrap">{appointment.doctorName}</td>
                   
                    <td className={`px-4 py-2 whitespace-nowrap ${getStatusClass(appointment.patientStatus).className}`}>
                      {getStatusClass(appointment.patientStatus).formattedStatus}
                    </td>
                    <td className={`px-4 py-2 whitespace-nowrap ${getStatusClass(appointment.doctorStatus).className}`}>
                      {getStatusClass(appointment.doctorStatus).formattedStatus}
                    </td>
                  </>
                )}
                {userRole === 'doctors' && (
                  <>
                    <td className="px-4 py-2 whitespace-nowrap  flex justify-center items-center">
                      <img src={getImageSrc(appointment.image)} alt={appointment.patientName} className="w-12 h-12 rounded-full object-cover" />
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap">{appointment.patientName}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="text-center py-4 text-gray-500 text-xl">No appointments</div>
      )}
    </div>
  );
};

const RecentAppointment = () => {
  const today = new Date();
  const [appointments, setAppointments] = useState([]);
  const user = useSelector((state) => state.user);
  const userRole = user.person; // Assume user.person contains the role

  const fetchAppointments = async () => {
    const todayDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    try {
      let url;
      if (userRole === "admin") {
        url = `http://localhost:5000/appointments/getappointments?date=${todayDate}`;
      } else if (userRole === "doctors") {
        url = `http://localhost:5000/appointments/getdoctorappointments?date=${todayDate}&doctorId=${user.id}`;
      }

      const res = await makeGETrequest(url);
      // console.log(res)
      setAppointments(res.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Error fetching appointments');
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return (
    <div className="bg-white rounded-xl p-5 shadow-md flex-1">
      <AppointmentsTable appointments={appointments} userRole={userRole} />
      <ToastContainer />
    </div>
  );
};

export default RecentAppointment;
