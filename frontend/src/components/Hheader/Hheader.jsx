import React, { useState,useEffect } from 'react';
import { Link } from 'react-router-dom';

const Hheader = () => {
  const [menuOpen, setMenuOpen] = useState(false); // State to manage menu visibility
  const [isSmall,setIsSmall] =useState(false)
  const toggleMenu = () => setMenuOpen(!menuOpen); // Function to toggle menu visibility

  const open = true; // Placeholder for other logic if needed
  useEffect(() => {
    const handleResize = () => {
      // console.log(window.innerWidth,isSmall)
      if (window.innerWidth <= 768) {
        setIsSmall(true);
      }
      else{
        setIsSmall(false)
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  return (
    <header className="bg-white shadow relative">
      <div className="container mx-auto px-10 py-3 flex flex-col md:flex-row justify-between">
        <div className="flex items-center mb-2 md:mb-0 space-x-4 ">
          <img
            src="./src/assets/logo.png"
            className={`cursor-pointer duration-700 w-10 h-10 ${!open && "duration-900"}`}
            alt="Logo"
          />
          <div className="text-2xl font-bold text-blue-700">HealthCare</div>
        </div>
        
        {/* Mobile menu button */}
        <button
          className="md:hidden absolute right-4 top-5 flex items-center text-blue-700"
          onClick={toggleMenu}
        >
        <div className="flex items-center mr-3"> 
          {isSmall &&(<Link
          to="/"
          className="bg-blue-500 text-white text-lg px-5 py-2 rounded-md hover:bg-blue-700"
        >
          Login
        </Link>)}</div>
        <div>
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
          </div>
        </button>

        {/* Navigation menu */}
        <nav className={`flex flex-col md:flex-row md:justify-center items-center space-y-4 md:space-y-0 md:space-x-6 ${menuOpen ? 'block' : 'hidden'} md:flex`}>
          <Link
            to="/searchDoctor"
            className="text-gray-700 hover:text-blue-600 hover:border-b-2 border-blue-500 transition-colors duration-300 text-lg font-medium"
          >
            Doctors
          </Link>

          <Link
            to="/blogs"
            className="text-gray-700 hover:text-blue-600 hover:border-b-2  border-blue-500 hover:border-b-2 transition-colors duration-300 text-lg font-medium"
          >
            Blogs
          </Link>
          <Link
            to="/about"
            className="text-gray-700 hover:text-blue-600 hover:border-b-2 border-blue-500 transition-colors duration-300 text-lg font-medium"
          >
            About Us
          </Link>
          <Link
            to="/contact"
            className="text-gray-700 hover:text-blue-600 hover:border-b-2 border-blue-500 transition-colors duration-300 text-lg font-medium"
          >
            Contact Us
          </Link>
          {/* Login Link */}

        </nav>
        {!isSmall &&(<Link
          to="/"
          className="bg-blue-500 text-white text-lg px-5 py-2 rounded-md hover:bg-blue-700"
        >
          Login
        </Link>)}
      </div>
    </header>
  );
};

export default Hheader;
