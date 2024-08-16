import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { FaUserMd, FaUser, FaCalendarCheck, FaClock } from 'react-icons/fa';
import { makeGETrequest } from "../../utils/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RecentAppointment from '../../components/RecentAppointment/RecentAppointment';

const menuItems = [
  { label: 'Patients', icon: <FaUser className="text-white" />, link: '/searchpatient', iconBgColor: 'bg-red-500', hoverColor: 'bg-gray-300' },
  { label: 'Doctors', icon: <FaUserMd className="text-white" />, link: '/searchdoctor', iconBgColor: 'bg-blue-500', hoverColor: 'bg-gray-300' },
  { label: 'Appointments', icon: <FaCalendarCheck className="text-white" />, link: '/appointments', iconBgColor: 'bg-green-500', hoverColor: 'bg-gray-300' },
  { label: 'Add Availability', icon: <FaClock className="text-white" />, link: '/addavailability', iconBgColor: 'bg-yellow-500', hoverColor: 'bg-gray-300' },
];

const AdminPanel = () => {
  const [doctorCount, setDoctorCount] = useState(0);
  const [patientCount, setPatientCount] = useState(0);
  const [totalAppointmentsCount, setTotalAppointmentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (user.person !== "admin") {
        navigate("/");
        return;
      }

      try {
        const res = await makeGETrequest("http://localhost:5000/doctors/alldoctors");
        const res1 = await makeGETrequest("http://localhost:5000/patients/allpatients");
        const res2 = await makeGETrequest("http://localhost:5000/appointments/allappointments", localStorage.getItem("token"));

        if (res.doctors) {
          setDoctorCount(res.doctors.length);
        } else {
          toast.error(res.message);
        }

        if (res1.patients) {
          setPatientCount(res1.patients.length);
        } else {
          toast.error(res1.message);
        }

        if (res2.totalAppointmentsCount !== undefined) {
          setTotalAppointmentsCount(res2.totalAppointmentsCount);
        } else {
          toast.error(res2.message);
        }
      } catch (error) {
        toast.error("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    if (user.username) {
      checkAdminAndFetchData();
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const messages = [
    {
      sender: "Lavanya M",
      // text: "Welcome to the admin panel. Here you can manage patients, doctors, and appointments. Stay tuned for more updates and notifications.",
      timestamp: "10:30 AM"
    },
    {
      sender: "Sha A",
      // text: "Remember to check the appointments section for today's schedule and ensure all doctors have updated their availability.",
      timestamp: "11:00 AM"
    },
    {
      sender: "Kumar K",
      // text: "Thank you for your dedication and hard work in maintaining the health and well-being of our patients.",
      timestamp: "11:30 AM"
    }
  ];

  return (
    <>
      <div className="flex pr-5 pl-5 mt-5 md:gap-5">
        <div className="flex-1 hidden sm:flex flex-col md:flex-row md:justify-center bg-blue-300 rounded-xl w-full md:w-1/2 md:h-44 ">
          <div className="flex-1 mt-8 ml-6">
            <h1 className="text-black text-3xl font-bold mb-4">Welcome Admin</h1>
            <p className="text-black lg:text-xl hidden lg:flex">When "I" is replaced by "We" Even "Illness" becomes "Wellness"</p>
          </div>
          <div className="flex-1 flex justify-center items-center">
            <img src="signinback.jpeg" alt="Image" className="md:w-full w-32 md:h-44 h-20 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:pl-2 ">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.link} className="text-decoration-none bg-white rounded-xl">
              <div className={`${item.color} p-2 md:mt-3 mt-3 sm:ml-2 flex items-center justify-right text-black`}>
                <div className={`w-10 h-10 flex justify-center items-center rounded-full ${item.iconBgColor}`}>
                  {item.icon}
                </div>
                <div className="md:text-xl text-base ml-4">
                  {item.label === 'Doctors' ? ` ${doctorCount} ${item.label}` :
                    item.label === 'Patients' ? ` ${patientCount} ${item.label}` :
                    item.label === 'Appointments' ? ` ${totalAppointmentsCount} ${item.label}` : 
                    item.label}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 grid-cols-1 gap-5 pl-5 mt-5">
        <div className="col-span-2 pr-5">
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Appointments For a Day</h2>
          <RecentAppointment />
        </div>
        <div className="col-span-1 pr-5">
          <h2 className="text-2xl font-bold mb-4 text-blue-500">Notifications</h2>
          <div className="bg-white rounded-xl p-5 shadow-md space-y-4">
            {messages.map((message, index) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-200 pb-4 mb-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex justify-center items-center mr-3">
                    <FaUser className="text-gray-500" />
                  </div>
                  <div>
                    <span className="block font-semibold text-blue-500">{message.sender}</span>
                    {/* <span className="block text-gray-400">{message.text}</span> */}
                  </div>
                </div>
                <span className="text-sm text-gray-400">{message.timestamp}</span>
              </div>
            ))}
            <div className="text-center mt-4">
              <button className="bg-blue-500 text-white py-2 px-4 rounded">See All Notifications</button>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
};

export default AdminPanel;
