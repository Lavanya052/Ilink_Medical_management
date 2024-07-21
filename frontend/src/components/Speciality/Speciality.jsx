import React from 'react';

const specialties = [
  { name: 'Cardiology', description: 'Top cardiologists available.', img: 'cardiology.png' },
  { name: 'Dermatology', description: 'Find the best dermatology.', img: 'dermatology.png' },
  { name: 'Neurology', description: 'Expert neurology doctors.', img: 'neurology.png' },
  { name: 'Orthopedic', description: 'Orthopedic specialists.', img: 'orthopedic.png' },
];

const Specialty = () => {
  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Book Your Nearest Available Doctors By Specialty</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {specialties.map((specialty) => (
            <div key={specialty.name} className="bg-white p-6 shadow-md rounded-md text-center">
              <img src={specialty.img} alt={specialty.name} className="w-full h-32 object-cover mb-4" />
              <h3 className="text-xl font-bold mb-2">{specialty.name}</h3>
              <p className="text-gray-600">{specialty.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Specialty;
