import React from 'react';

const Steps = () => {
  return (
    <section className="container mx-auto px-4 py-20">
      <h2 className="text-3xl font-bold text-center mb-12">Three Steps To Complete Your Health Checkup</h2>
      <p className="text-center mb-8">Follow These Steps And Complete Your Health Checkup With The Best Doctors</p>
      <div className="flex flex-wrap justify-center gap-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 w-full max-w-sm text-center">
          <div className="bg-gray-100 p-8 rounded-full mx-auto mt-6">
            <img src="searchdoc.png" alt="Search Doctors" className="w-16 h-16 object-cover mx-auto" />
          </div>
          <h3 className="text-2xl font-bold mb-2 mt-4">Search Doctors</h3>
          <p className="text-gray-600 mb-6 px-4">Find the best doctors in your area.</p>
        </div>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 w-full max-w-sm text-center">
          <div className="bg-gray-100 p-8 rounded-full mx-auto mt-6">
            <img src="book_icon.png" alt="Book Appointment" className="w-16 h-16 object-cover mx-auto" />
          </div>
          <h3 className="text-2xl font-bold mb-2 mt-4">Book Appointment</h3>
          <p className="text-gray-600 mb-6 px-4">Book an appointment online.</p>
        </div>
        <div className="bg-white shadow-xl rounded-lg overflow-hidden transform transition-transform duration-300 hover:scale-105 w-full max-w-sm text-center">
          <div className="bg-gray-100 p-8 rounded-full mx-auto mt-6">
            <img src="consult_icon.png" alt="Consult With Doctor" className="w-16 h-16 object-cover mx-auto" />
          </div>
          <h3 className="text-2xl font-bold mb-2 mt-4">Consult With Doctor</h3>
          <p className="text-gray-600 mb-6 px-4">Consult with the doctor during your appointment.</p>
        </div>
      </div>
    </section>
  );
};

export default Steps;
