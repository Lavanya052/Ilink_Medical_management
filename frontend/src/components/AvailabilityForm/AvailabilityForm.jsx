import React, { useState,useEffect } from 'react';
import { format, isPast, startOfDay, endOfDay } from 'date-fns'; 
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for notifications

const AvailabilityForm = ({ selectedDate, onSubmit }) => {
  const [notAvailable, setNotAvailable] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [interval, setInterval] = useState('');

  const StimeOptions = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM'
  ];
  const EtimeOptions = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
    '06:00 PM', '07:00 PM', '08:00 PM', '09:00 PM', '10:00 PM'
  ];
  const IntervalOptions = ['15', '30'];

  const handleNotAvailableChange = (event) => {
    const isNotAvailable = event.target.checked;
    setNotAvailable(isNotAvailable);
    if (isNotAvailable) {
      setStartTime('');
      setEndTime('');
      setInterval('');
    }
  };

  useEffect(() => {
    // Reset the fields when selectedDate changes
    setStartTime('');
    setEndTime('');
    setInterval('');
    setNotAvailable(false);
  }, [selectedDate]);

  const handleStartTimeChange = (event) => {
    setStartTime(event.target.value);
    setEndTime(''); // Reset end time when start time changes
  };

  const convertTimeToDate = (time) => {
    const [hourMin, period] = time.split(' ');
    let [hour, minute] = hourMin.split(':');
    hour = parseInt(hour, 10);
    minute = parseInt(minute, 10);
    if (period === 'PM' && hour !== 12) {
      hour += 12;
    }
    if (period === 'AM' && hour === 12) {
      hour = 0;
    }
    return new Date(1970, 0, 1, hour, minute);
  };

  const filteredEndTimeOptions = EtimeOptions.filter(time => {
    if (!startTime) return true; // Show all end times if no start time is selected
    const start = convertTimeToDate(startTime);
    const end = convertTimeToDate(time);
    return end > start;
  });

  const handleSubmit = (event) => {
    event.preventDefault();

    const currentDate = new Date();
    const startOfSelectedDate = startOfDay(selectedDate);
    const endOfSelectedDate = endOfDay(selectedDate);

    // Validate if selectedDate is today or in the future
    if (isPast(endOfSelectedDate) && startOfSelectedDate < startOfDay(currentDate)) {
      toast.warning("Please select a future date or today's date.");
      return;
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

    const availabilityData = {
      date: dateOnly,
      startTime,
      endTime,
      interval,
      notAvailable,
      booked:[],
    };

    onSubmit(availabilityData);
  };

  return (
    <form className="lg:p-5 p-2 border-2 border-gray-300 rounded-lg shadow-lg bg-white" onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center">
        <label className="block w-1/3 mb-1 text-xl text-black">Date</label>
        <span className={`w-2/3 ${isPast(endOfDay(selectedDate)) ? 'text-red-500 text-lg' : 'text-gray-900 text-lg'}`}>
          {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
        </span>
      </div>
      <div className="mb-4 flex items-center">
        <label className="block w-1/3 mb-1 text-lg text-black">Start Time</label>
        <select
          className={`border-2 border-gray-300 rounded-lg w-2/3 p-2 ${notAvailable ? 'bg-gray-200' : ''}`}
          disabled={notAvailable || isPast }
          value={startTime}
          onChange={handleStartTimeChange}
        >
          <option value="" disabled className="text-gray-400"></option>
          {StimeOptions.map((time, index) => (
            <option key={index} value={time}>{time}</option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex items-center">
        <label className="block w-1/3 mb-1 text-lg text-black">End Time</label>
        <select
          className={`border-2 border-gray-300 rounded-lg w-2/3 p-2 ${notAvailable ? 'bg-gray-200' : ''}`}
          disabled={notAvailable || isPast }
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
        >
          <option value="" disabled className="text-gray-400"></option>
          {filteredEndTimeOptions.map((time, index) => (
            <option key={index} value={time}>{time}</option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex items-center">
        <label className="block w-1/3 mb-1 text-lg text-black">Interval</label>
        <select
          className={`border-2 border-gray-300 rounded-lg w-2/3 p-2 ${notAvailable ? 'bg-gray-200' : ''}`}
          disabled={notAvailable || isPast }
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <option value="" disabled className="text-gray-400"></option>
          {IntervalOptions.map((interval, index) => (
            <option key={index} value={interval}>{interval+"mins"}</option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex items-center ml-32 md:ml-32">
        <input type="checkbox" disabled={isPast} checked={notAvailable} onChange={handleNotAvailableChange} />
        <label className="inline-flex items-center ml-1 text-gray-700">Not Available</label>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isPast(endOfDay(selectedDate)) && startOfDay(selectedDate) < startOfDay(new Date())} className={`bg-blue-700 text-white p-2 w-24 rounded-md hover:bg-blue-800 ${isPast(endOfDay(selectedDate)) && startOfDay(selectedDate) < startOfDay(new Date()) ? 'opacity-50 cursor-not-allowed' : ''}`}>
          Submit
        </button>
      </div>
    </form>
  );
};

export default AvailabilityForm;
