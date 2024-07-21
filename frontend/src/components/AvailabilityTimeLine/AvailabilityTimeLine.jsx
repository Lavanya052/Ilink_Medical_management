import React, { useState, useEffect } from 'react';
import { format, isPast, startOfDay, endOfDay } from 'date-fns';
import { toast } from 'react-toastify'; // Assuming you're using react-toastify for notifications

const AvailabilityTimeLine = ({ selectedDate, selectedStartTime, selectedEndTime, onSubmit }) => {
  const [notAvailable, setNotAvailable] = useState(false);
  const [startTime, setStartTime] = useState(selectedStartTime || '');
  const [endTime, setEndTime] = useState(selectedEndTime || '');
  const [interval, setInterval] = useState('');

  const IntervalOptions = ['15', '30'];

  useEffect(() => {
    // Reset the fields when selectedDate changes
    setStartTime(selectedStartTime || '');
    setEndTime(selectedEndTime || '');
    setInterval('');
    setNotAvailable(false); // Uncheck "Not Available" checkbox
  }, [selectedDate, selectedStartTime, selectedEndTime]);

  const handleNotAvailableChange = (event) => {
    const isNotAvailable = event.target.checked;
    setNotAvailable(isNotAvailable);
    if (isNotAvailable) {
      setStartTime('');
      setEndTime('');
      setInterval('');
    }
  };

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


  const handleSubmit = (event) => {
    event.preventDefault();

    if (!notAvailable){
      if (!selectedDate || startTime === "" || endTime === "" || interval === "") {
      toast.warning("Please select all the required fields");
      return;}
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
      booked: [],
    };

    console.log('Submitted Data:', availabilityData);
    onSubmit(availabilityData);
  };

  // Disable the submit button if the selected date is in the past
  const isDatePast = selectedDate && isPast(endOfDay(selectedDate)) && startOfDay(selectedDate) < startOfDay(new Date());

  return (
    <form className="lg:p-3 p-2 border-2 border-gray-300 rounded-lg shadow-lg bg-white" onSubmit={handleSubmit}>
      <div className="mb-4 flex items-center">
        <label className="block w-1/3 mb-1 text-lg text-black">Date</label>
        <span className={`border-2 border-gray-300 rounded-lg w-2/3 p-2 ${isDatePast ? 'bg-red-200 text-red-900' : (notAvailable ? 'bg-gray-200' : '')} ${!selectedDate ? 'text-gray-400' : 'text-gray-900 text-lg'}`}>
          {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'No date selected'}
        </span>
      </div>
      <div className="mb-4 flex items-center">
        <label className="block w-1/3 mb-1 text-lg text-black">Start Time</label>
        <input
          className={`border-2 border-gray-300 rounded-lg w-2/3 p-2 ${notAvailable ? 'bg-gray-200' : ''}`}
          disabled={notAvailable || isDatePast }
          value={selectedStartTime}
          onChange={handleStartTimeChange}
        />
      </div>
      <div className="mb-4 flex items-center">
        <label className="block w-1/3 mb-1 text-lg text-black">End Time</label>
        <input
          className={`border-2 border-gray-300 rounded-lg w-2/3 p-2 ${notAvailable ? 'bg-gray-200' : ''}`}
          disabled={notAvailable || isDatePast }
          value={selectedEndTime}
          onChange={(e) => setEndTime(e.target.value)}
        />
      </div>
      <div className="mb-4 flex items-center">
        <label className="block w-1/3 mb-1 text-lg text-black">Interval</label>
        <select
          className={`border-2 border-gray-300 rounded-lg w-2/3 p-2 ${notAvailable ? 'bg-gray-200' : ''}`}
          disabled={notAvailable || isDatePast }
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <option value="" disabled className="text-gray-400"></option>
          {IntervalOptions.map((interval, index) => (
            <option key={index} value={interval}>{interval + "mins"}</option>
          ))}
        </select>
      </div>
      <div className="mb-4 flex items-center ml-32 md:ml-32">
        <input type="checkbox" disabled={isDatePast} checked={notAvailable} onChange={handleNotAvailableChange} />
        <label className="inline-flex items-center ml-1 text-gray-700">Not Available</label>
      </div>
      <div className="flex justify-end">
        <button type="submit" disabled={isDatePast} className={`bg-blue-700 text-white p-2 w-24 rounded-md hover:bg-blue-800 ${isDatePast ? 'opacity-50 cursor-not-allowed' : ''}`}>
          Submit
        </button>
      </div>
    </form>
  );
};

export default AvailabilityTimeLine;
