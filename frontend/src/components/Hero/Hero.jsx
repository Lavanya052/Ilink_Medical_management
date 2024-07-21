import React from 'react';
import backgroundImage from '../../../public/homeback.jpeg'; // Adjust the path to your background image
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes } from '@fortawesome/free-solid-svg-icons';
const Hero = () => {
  return (
    <section
      className="bg-cover  bg-no-repeat bg-center"
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className="bg-blue-400 bg-opacity-30 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold  mb-4">Book Your <span className='text-blue-700'>Next Doctor's</span> Appointment</h1>
          <p className="text-lg  mb-6">Find the best doctors and book appointments online</p>
          <div className="flex justify-center space-x-4">
            <input
              type="text"
              placeholder="Search by Specialty or Doctor's name"
              className="w-1/3 p-3 border border-gray-300 rounded-md"
            />
             
             <button className="bg-blue-500 text-white px-4 rounded-md">
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
