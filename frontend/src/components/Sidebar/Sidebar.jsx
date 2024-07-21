import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { MdDashboardCustomize, MdPerson, MdLogin, MdPersonAdd } from "react-icons/md";
import { RiCalendarScheduleLine } from "react-icons/ri";
import { TbReportMedical } from "react-icons/tb";
import { IoArrowBackCircle } from "react-icons/io5";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { isTokenExpired } from '../../utils/isTokenExpired';

const Sidebar = () => {
  const [open, setOpen] = useState(true);
  const [tokenExpired, setTokenExpired] = useState(false);
  const userSelector = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (isTokenExpired(token)) {
      setTokenExpired(true);
      toast.error('Session expired. Please log in again.');
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1200) {
        setOpen(false);
      } else {
        setOpen(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const docMenus = [
    { title: "Dashboard", icon: <MdDashboardCustomize size={24} color="black" />, link: "/doctorpanel" },
    { title: "Report", icon: <TbReportMedical size={24} color="black" />, link: "/report" },
    { title: "My Patients", icon: <MdPerson size={24} color="black" />, link: "/patients" },
    { title: "Appointments", icon: <RiCalendarScheduleLine size={24} color="black" />, link: "/appointments" },
  ];

  const adminMenus = [
    { title: "Dashboard", icon: <MdDashboardCustomize size={24} color="black" />, link: "/adminpanel" },
    { title: "Doctors", icon: <MdPersonAdd size={24} color="black" />, link: "/registerDoctor" },
    { title: "Patients", icon: <MdPersonAdd size={24} color="black" />, link: "/registerpatient" },
    { title: "Report", icon: <TbReportMedical size={24} color="black" />, link: "/report" },
    { title: "Appointments Booking", icon: <RiCalendarScheduleLine size={24} color="black" />, link: "/appointmentbooking" },
  ];

  const Menus = userSelector.admin ? adminMenus : docMenus;

  return (
    <div className="flex">
      <div className={`${open ? "w-44" : "w-20"} bg-sky-200 h-screen p-5 pt-5 relative duration-700 shadow-sm shadow-sky-200 transition-all bo`}>
        <div className={`flex flex-col items-center ${open ? 'gap-x-1' : 'mt-2'}`}>
          <div className="flex items-center">
            <img
              src="./src/assets/logo.png"
              className={`cursor-pointer duration-700 w-10 h-10 -ml-3 mt-0 ${!open && "ml-0  mb-4 w-10 h-10 duration-900"}`}
            />
            {open && (
              <h1 className="text-black origin-left font-medium text-xl duration-700 transition-all mt-1 ml-2">
                HealthCare
              </h1>
            )}
          </div>

          {/* Arrow */}
          <IoArrowBackCircle
            className={`cursor-pointer text-4xl transition-transform duration-700 ease-in-out mt-2 self-center
      ${open ? "rounded-l-xl h-8 w-8" : "rotate-180 h-8 w-8 rounded-r-xl"} `}
            onClick={() => setOpen(!open)}
          />
        </div>
        <ul className="pt-2">
          {Menus.map((Menu, index) => (
            <li
              key={index}
              className={`group relative flex items-center justify-center p-2 cursor-pointer text-gray-300 text-sm mt-4 
                ${Menu.gap ? "mt-20" : "mt-1"} ${open ? "w-full h-20 rounded-md border bg-neutral-100/50 border-sky-600 shadow-xl shadow-sky-400 hover:bg-light-white" : "mt-0"} 
                transition-all duration-700`}
            >
              <Link to={Menu.link} className="flex flex-col items-center justify-center w-full h-full" onClick={() => setOpen(false)}>
                <div>
                  {Menu.icon}
                </div>
                {open && (
                  <span className="text-center origin-left duration-700 text-black text-base">
                    {Menu.title}
                  </span>
                )}
                {!open && (
                  <span className="absolute left-full ml-2 w-auto p-2 text-black bg-zinc-100 rounded shadow-lg text-sm hidden group-hover:block">
                    {Menu.title}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
        {tokenExpired && (
          <div className="absolute bottom-5 left-5 flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <MdLogin size={24} color="black" />
            <span className={`ml-2 text-black ${open ? 'block' : 'hidden'}`}>Log In</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
