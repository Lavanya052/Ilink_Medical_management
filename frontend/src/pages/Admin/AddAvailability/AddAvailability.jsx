import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './AddAvailability.css';
import { makePOSTrequest, makeGETrequest } from "../../../utils/api";
import { useLocation, useNavigate } from 'react-router-dom';
import AvailabilityForm from "../../../components/AvailabilityForm/AvailabilityForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AddAvailability = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPreview, setShowPreview] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [availabilityTiles, setAvailabilityTiles] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorId, doctorFName, doctorLName, imageUrl } = location.state || { doctorId: '', doctorFName: '', doctorLName: '', imageUrl: '' };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handlePreviewToggle = () => {
    setShowPreview(!showPreview);
  };

  // Function to handle screen resize
  const handleResize = () => {
    setIsMobile(window.innerWidth <= 768);
  };

  const fetchAvailability = async (doctorId) => {
    try {
      const res = await makeGETrequest(
        `http://localhost:5000/doctors/getavailability/${doctorId}`,
        localStorage.getItem("token")
      );

      console.log(res);
      if (res.status === 200) {
        setAvailabilityTiles(res.availability); // Assuming your API response structure has availability data
      } else {
        toast.error(res.message || 'Failed to fetch availability');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch availability');
    }
  };

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    fetchAvailability(doctorId); // Fetch availability data on component mount or when doctorId changes
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [doctorId]);

  const handleSubmit = async (availabilityData) => {
    try {
      const res = await makePOSTrequest(
        "http://localhost:5000/doctors/addavailability",
        { doctorId,date:selectedDate, availability: [availabilityData] },
        localStorage.getItem("token")
      );
      if (res.status === 200) {
        toast.success(res.message || 'Availability submitted successfully!');
        fetchAvailability(doctorId); // Refresh availability data after submission
      } else if (res.status === 409) {
        const confirmed = window.confirm(res.message+" overwrite?");
        if (confirmed) {
          const overwriteRes = await makePOSTrequest(
            "http://localhost:5000/doctors/addavailability",
            { doctorId,date:selectedDate, availability: [availabilityData], overwrite: true },
            localStorage.getItem("token")
          );
          console.log(overwriteRes)
          if (overwriteRes.status === 200) {
            toast.success('Availability updated successfully!');
            fetchAvailability(doctorId); // Refresh availability data after submission
          } else {
            toast.error(overwriteRes.message || 'Failed to update availability');
          }
        }
      } else {
        toast.error(res.message || 'Failed to submit availability');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit availability');
    }
  };

  const AvailabilityTile = ({ availability }) => {


    return (<>
    
    <div className="availability-tile bg-white p-4 mb-2 rounded-lg shadow-md">
      <h4 className="text-gray-900 font-bold">{availability.date}</h4>
      {!availability.notAvailable && (
        <p className="text-gray-600">
          {availability.startTime}{"-"}{availability.endTime}
        </p>
      )}
      {availability.notAvailable && (
        <p className="text-gray-600">Not available</p>
      )}
      <p className="text-gray-600">{availability.status}</p>
    </div>
      </>
    );
  };

  return (
    <div className={`add-availability-page ${isMobile ? 'md:min-h-screen' : 'h-full'}`}>
       <h3 className="text-blue-700  mb-1 text-3xl font-bold mt-4 ml-4 mb-6">Set Availability</h3>
    <div className="relative top-15 left-4 w-72 bg-white p-4 rounded-lg shadow-md flex items-center hidden lg:flex">
      {imageUrl && (
        <img
          src={imageUrl}
          alt={`${doctorFName}'s profile`}
          className="h-16 w-16 rounded-full object-cover mr-4"
        />
      )}
      {imageUrl && (
        <div>
          <h3 className="text-gray-900 text-xl mb-1 font-bold">
            Dr. {doctorFName} {doctorLName}
          </h3>
          <h4 className="text-gray-600 text-md">
            <span className="font-semibold">ID:</span> {doctorId}
          </h4>
        </div>
      )}
    </div>
    <div className="flex-1 mt-4 md:mt-15">
  <div className="flex flex-col md:flex-row flex-wrap ml-3 mr-3"> 
    <div className="w-full md:w-1/3 p-2 ">
    <h1 className='text-blue-600 text-bold text-xl mb-4 font-semibold'>Select a Date</h1>
      <Calendar
        className="custom-calendar"
        onClickDay={handleDateClick}
        value={selectedDate}
      />
    </div>
    <div className="w-full md:w-1/3 p-2">
    <h1 className='text-blue-600 text-bold text-xl mb-4 font-semibold'>Choose Availability</h1>
      <AvailabilityForm selectedDate={selectedDate} onSubmit={handleSubmit} />
    </div>
    <div className="w-full md:w-1/3 p-2">
      <h1 className="text-blue-600 text-bold text-xl mb-4 font-semibold">Time slots</h1>
      {availabilityTiles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {availabilityTiles.map((availability, index) => (
            <AvailabilityTile key={index} availability={availability} />
          ))}
        </div>
      ) : (
        <div className="text-gray-600 text-bold text-xl">No availability data to show.</div>
      )}
    </div>
  </div>
</div>

    <ToastContainer />
  </div>
  
  );
};

export default AddAvailability;
