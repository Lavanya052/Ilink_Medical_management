import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { makeGETrequest } from "../../utils/api";
import CustomForm from "../../components/CustomForm/CustomForm"; // Assuming you have these custom components
import Button from "../../components/Button/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditPatientD = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { patientId } = location.state || { patientId: '' };
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        birthday: '',
        gender: ''
    });

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const res = await makeGETrequest(`http://localhost:5000/patients/getpatientDetails?id=${patientId}`, localStorage.getItem("token"));
                setFormData(res.patient);
            } catch (error) {
                console.error('Error fetching patient data', error);
                toast.error('Failed to fetch patient details.');
            }
        };

        fetchPatientData();
    }, [patientId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put('/api/patients/update', formData);
            if (response.data.success) {
                toast.success('Patient details updated successfully');
                navigate('/home'); // Redirect to a different page if needed
            } else {
                toast.error('Failed to update patient details');
            }
        } catch (error) {
            console.error('Error updating patient details', error);
            toast.error('An error occurred. Please try again.');
        }
    };

    return (
        <div className="flex flex-col md:flex-row p-4 bg-gray-100 mt-10">
            <div className="md:w-1/3 hidden lg:flex flex-col items-center justify-center">
                <img src="register.jpg" alt="register" className="w-45 h-45 object-cover" />
            </div>
            <div className="lg:w-2/3 w-full bg-white shadow-md rounded-xl p-6 max-w-4xl mx-auto mt-4">
                <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Edit Patient Details</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-2">
                    <div className="ml-5 mr-5">
                        <CustomForm.FirstName
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="First Name"
                            name="firstName"
                        />
                    </div>
                    <div className="ml-5 mr-5">
                        <CustomForm.LastName
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Last Name"
                            name="lastName"
                        />
                    </div>
                    <div className="ml-5 mr-5">
                        <CustomForm.Email
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            name="email"
                        />
                    </div>
                    <div className="ml-5 mr-5">
                        <CustomForm.Phone
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Phone"
                            name="phone"
                        />
                    </div>
                    <div className="ml-5 mr-5">
                        <CustomForm.Address
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Address"
                            name="address"
                        />
                    </div>
                    <div className="ml-5 mr-5">
                        <CustomForm.Birthday
                            value={formData.birthday}
                            onChange={handleChange}
                            name="birthday"
                        />
                    </div>
                    <div className="ml-5 mr-5">
                        <CustomForm.Gender
                            value={formData.gender}
                            onChange={handleChange}
                            name="gender"
                        />
                    </div>
                    <div className="col-span-2 flex justify-end">
                        <Button value={"Save"} type="submit" />
                    </div>
                </form>
                <ToastContainer />
            </div>
        </div>
    );
};

export default EditPatientD;
