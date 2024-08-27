import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';
import { FaUserMd, FaUser, FaCalendarCheck, FaClock, FaCheck } from 'react-icons/fa';
import { makeGETrequest } from "../../../utils/api";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RecentAppointment from '../../../components/RecentAppointment/RecentAppointment';
import ARAppointment from '../../../components/ARAppointments/ARAppointments';
import { ImCross } from "react-icons/im";

const menuItems = [
  { label: 'Appointments', icon: <FaUser className="text-white" />, link: '/doctorappointments', iconBgColor: 'bg-blue-500', hoverColor: 'bg-gray-300' },
  { label: 'Accepted', icon: <FaCheck className="text-white" />, link: '/doctorappointments', iconBgColor: 'bg-green-500', hoverColor: 'bg-gray-300' },
  { label: 'Rejected', icon: <ImCross className="text-white" />, link: '/doctorappointments', iconBgColor: 'bg-red-500', hoverColor: 'bg-gray-300' },
  { label: 'Pending', icon: <FaClock className="text-white" />, link: '/doctorappointments', iconBgColor: 'bg-yellow-500', hoverColor: 'bg-gray-300' },
];

const DoctorPanel = () => {
  const [appointments,setAppointments]=useState([])
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        const res = await makeGETrequest(`http://localhost:5000/appointments/alldocappointments?doctorId=${user.id}`,localStorage.getItem("token"));
        // console.log(res)
        setAppointments(res.appointments)
      } catch (error) {
        toast.error("Error fetching Patient");
      } finally {
        setLoading(false);
      }
    };

    if (user.username) {
      checkAdminAndFetchData();
    }
  }, [user, navigate]);

  useEffect(()=>{
    let totalAppointments = 0;
    let accepted = 0;
    let rejected = 0;
    let pending = 0;

    appointments?appointments?.forEach(appointmentDay => {
      appointmentDay.doctors?.forEach(doctor => {
        doctor.appointments.forEach(appointment => {
          totalAppointments++;
          // console.log(totalAppointments)
          const status = appointment.doctorStatus;
          if (status === "accepted") {
            accepted++;
          } else if (status === "rejected") {
            rejected++;
          } else if (status === "pending") {
            pending++;
          }
        });
      });
    }):

    console.log(totalAppointments)
    setAppointmentsCount(totalAppointments);
    setAcceptedCount(accepted);
    setRejectedCount(rejected);
    setPendingCount(pending);

  },[appointments])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }


  return (
    <>
      <div className="flex pr-5 pl-5 mt-5 md:gap-5">
        <div className="flex-1 hidden sm:flex flex-col md:flex-row md:justify-center bg-blue-300 rounded-xl w-full md:w-1/2 md:h-44 ">
          <div className="flex-1 mt-8 ml-6">
            <h1 className="text-black text-3xl font-bold mb-4">Welcome Dr. {user.firstname} {user.lastname}</h1>
            <p className="text-black lg:text-xl hidden xl:flex">When "I" is replaced by "We" Even "Illness" becomes "Wellness"</p>
          </div>
          <div className="flex-2 hidden lg:flex justify-center items-center">
            <img src="signinback.jpeg" alt="Image" className="md:w-full w-32 md:h-44 h-20 rounded-xl" />
          </div>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-2 gap-2 sm:pl-2 ">
          {menuItems.map((item, index) => (
            <Link key={index} to={item.link} className="text-decoration-none bg-white rounded-xl">
              <div className={`${item.color} p-2 md:mt-3 mt-3 sm:ml-2 flex items-center justify-right text-black`}>
                <div className={`w-10 h-10 flex justify-center items-center rounded-full ${item.iconBgColor}`}>
                  {item.icon}
                </div>
                <div className="md:text-xl text-base ml-4">
                  {item.label === 'Appointments' ? ` ${appointmentsCount} ${item.label}` :
                    item.label === 'Rejected' ? ` ${rejectedCount} ${item.label}` :
                    item.label === 'Accepted' ? ` ${acceptedCount} ${item.label}` :
                    item.label === 'Pending' ? ` ${pendingCount} ${item.label}` :
                    item.label}
                </div>
              </div>
            </Link>
          ))}
        </div>

      </div>

      <div className="grid  md:grid-cols-3 gap-5 px-5 mt-5">
        <div className="md:col-span-2 col-span-1">
          <h2 className="text-2xl font-bold mb-4  text-blue-500">Appointments For a Day</h2>
          <RecentAppointment />
        </div>
        <div className="col-span-1">
          <h2 className="text-2xl font-bold mb-4  text-blue-500">Pending Approvals</h2>
          <div className="bg-white rounded-xl p-4  shadow-md">
            <ARAppointment />
          </div>
        </div>
      </div>

    </>
  );
};

export default DoctorPanel;
