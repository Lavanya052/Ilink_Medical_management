import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { makeGETrequest } from "../../utils/api";


const DateSelection = ({
  selectedDay,
  handleDayChange,
  selectedMonth,
  handleMonthChange,
  selectedYear,
  handleYearChange
}) => {
  // Options for days, months, and years
  const dayOptions = [...Array(31)].map((_, index) => ({ value: index + 1, label: index + 1 }));
  const monthOptions = [...Array(12)].map((_, index) => ({
    value: index + 1,
    label: new Date(2000, index, 1).toLocaleString('default', { month: 'long' })
  }));
  const yearOptions = [...Array(21)].map((_, index) => ({ value: index + 2020, label: index + 2020 }));

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">Select Date:</label>
      <div className="flex items-center gap-2">
        <Select
          value={selectedDay}
          onChange={handleDayChange}
          options={dayOptions}
          className="w-20"
          placeholder="Day"
          menuPortalTarget={document.body}
          menuPosition={'fixed'}
          menuPlacement={'auto'}
        />
        <Select
          value={selectedMonth}
          onChange={handleMonthChange}
          options={monthOptions}
          className="w-28"
          placeholder="Month"
          menuPortalTarget={document.body}
          menuPosition={'fixed'}
          menuPlacement={'auto'}
        />
        <Select
          value={selectedYear}
          onChange={handleYearChange}
          options={yearOptions}
          className="w-24"
          placeholder="Year"
          menuPortalTarget={document.body}
          menuPosition={'fixed'}
          menuPlacement={'auto'}
        />
      </div>
    </div>
  );
};


const AppointmentsTable = ({ appointments }) => {
  const sortedAppointments = [];

  appointments?.doctors?.forEach(doctor => {
    doctor.appointments.forEach(appointment => {
      sortedAppointments.push({
        ...appointment,
        doctorId: doctor.doctorId,
        doctorName: doctor.doctorName
      });
    });
  });

  sortedAppointments.sort((a, b) => new Date(`1970-01-01T${a.time}:00Z`) - new Date(`1970-01-01T${b.time}:00Z`));
  const getStatusClass = (status) => {
    switch (status) {
      case 'pending':
        return ' text-yellow-500';
      case 'scheduled':
        return ' text-blue-700';
      case 'completed':
        return 'text-green-800';
      default:
        return '';
    }
  };

  return (
    <div className="overflow-x-auto">
      {sortedAppointments.length > 0 ? (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Name</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 text-left">
            {sortedAppointments.map((appointment, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.time}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.doctorName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{appointment.patientName}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${getStatusClass(appointment.patientStatus)}`}>{appointment.patientStatus}</td>
                <td className={`px-6 py-4 whitespace-nowrap ${getStatusClass(appointment.doctorStatus)}`}>{appointment.doctorStatus}</td>
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
// Main Component
const RecentAppointment = () => {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState({ value: today.getDate(), label: today.getDate() });
  const [selectedMonth, setSelectedMonth] = useState({
    value: today.getMonth() + 1,
    label: new Date(today.getFullYear(), today.getMonth(), 1).toLocaleString('default', { month: 'long' })
  });
  const [selectedYear, setSelectedYear] = useState({ value: today.getFullYear(), label: today.getFullYear() });
  const [appointments, setAppointments] = useState([]);

  const handleDayChange = (selectedOption) => setSelectedDay(selectedOption);
  const handleMonthChange = (selectedOption) => setSelectedMonth(selectedOption);
  const handleYearChange = (selectedOption) => setSelectedYear(selectedOption);

  const fetchAppointments = async () => {
    if (!selectedDay || !selectedMonth || !selectedYear) {
      toast.error("Select day, month, and year");
      return;
    }

    const selectedDate = `${selectedYear.value}-${String(selectedMonth.value).padStart(2, '0')}-${String(selectedDay.value).padStart(2, '0')}`;
    try {
      const res = await makeGETrequest(`http://localhost:5000/appointments/getappointments?date=${selectedDate}`);
      setAppointments(res.appointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [selectedDay, selectedMonth, selectedYear]);

  return (
    <div className="bg-white rounded-xl p-5 shadow-md flex-1">
      <DateSelection
        selectedDay={selectedDay}
        handleDayChange={handleDayChange}
        selectedMonth={selectedMonth}
        handleMonthChange={handleMonthChange}
        selectedYear={selectedYear}
        handleYearChange={handleYearChange}
      />
      <AppointmentsTable appointments={appointments} />
    </div>
  );
};

export default RecentAppointment;
