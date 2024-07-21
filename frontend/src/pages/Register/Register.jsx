import React, { useState } from 'react';
import './Register.css';
import CustomForm from '../../components/CustomForm/CustomForm';
import Button from '../../components/Button/Button';

const Register = () => {
  const [userType, setUserType] = useState('doctor');
  const [formData, setFormData] = useState({
    id: '',
    email: '',
    phone: '',
    password: '',
    username: '',
    address: '',
    medicalRecord: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };


  return (
    <div className="registration-container">
      <h2>Register {userType === 'doctor' ? 'Doctor' : 'Patient'}</h2>
      <div className="user-type-toggle">
        <button onClick={() => setUserType('doctor')} className={userType === 'doctor' ? 'active' : ''}>Doctor</button>
        <button onClick={() => setUserType('patient')} className={userType === 'patient' ? 'active' : ''}>Patient</button>
      </div>
      <CustomForm>
        <CustomForm.Id name="id" value={formData.id} onChange={handleChange} placeholder="Patient Id"/>
        <CustomForm.Username name="username" value={formData.username} onChange={handleChange} />
        <CustomForm.Email name="email" value={formData.email} onChange={handleChange} />
        <CustomForm.Password name="password" value={formData.password} onChange={handleChange} />
        <CustomForm.Phone name="phone" value={formData.phone} onChange={handleChange} /> <br />
        {userType === 'doctor' && (
          <>
            <span>Doctor Image:</span>
            <CustomForm.Image name="image" onChange={handleChange} /> <br /> <br />
          </>
        )}
        {userType === 'patient' && (
            <><CustomForm.Address name="address" value={formData.address} onChange={handleChange} /> <br /></>
        )}
        <Button value="Register" />
      </CustomForm>
    </div>
  );
};

export default Register;
