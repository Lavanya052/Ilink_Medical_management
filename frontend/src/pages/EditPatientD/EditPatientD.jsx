import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { makeGETrequest, makePOSTreqForm } from "../../utils/api";
import CustomForm from "../../components/CustomForm/CustomForm";
import Button from "../../components/Button/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';

const EditPatientD = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null); // Reference to the file input
    const userSelector = useSelector((state) => state.user);

    // Extract patientId from location state or default to empty string
    const { patientId } = location.state || { patientId: '' };

    // State to hold form data
    const [formData, setFormData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        birthday: '',
        gender: '',
        imageUrl: '',
        imageFile: null // For handling new image uploads
    });

    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const res = await makeGETrequest(
                    `http://localhost:5000/patients/getpatientDetails?id=${patientId}`,
                    localStorage.getItem("token")
                );
                if (res.patient) {
                    const patientData = {
                        ...res.patient,
                        imageUrl: res.patient.image
                            ? `data:${res.patient.image.contentType};base64,${res.patient.image.data}`
                            : ''
                    };
                    setFormData(patientData);
                }
            } catch (error) {
                console.error('Error fetching patient data', error);
                toast.error('Failed to fetch patient details.');
            }
        };

        if (patientId) {
            fetchPatientData();
        }
    }, [patientId, location]); // Add location as a dependency to trigger re-fetching

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setFormData((prevData) => ({
                ...prevData,
                imageUrl,
                imageFile: file
            }));
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formPayload = new FormData();

        if (formData.imageFile) {
            formPayload.append("file", formData.imageFile);
        }

        // Append form fields
        formPayload.append("data", JSON.stringify({
            id: patientId,
            email: formData.email,
            phone: formData.phone,
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            gender: formData.gender,
            birthday: formData.birthday,
        }));

        try {
            const res = await makePOSTreqForm(
                "http://localhost:5000/patients/editpatient",
                formPayload,
                localStorage.getItem("token")
            );

            if (res.status === 201) {
                toast.success(res.message);
                setTimeout(() => {
                    if(userSelector.admin)
                        navigate("/searchpatient");
                    if(userSelector.doctor)
                        navigate("/mypatients")
                }, 2000);
            } else {
                toast.error(res.message);
                setTimeout(() => {
                    navigate("/editpatientdetails", { state: { patientId: patientId } });
                }, 2000);
            }
        } catch (error) {
            console.error('Error updating patient details', error);
            toast.error('An error occurred. Please try again.');
        }
    };

    return (
        <>
            <nav className="flex py-3 px-5 bg-gray-100 rounded-md w-full">
                <ol className="list-reset flex text-grey-dark">
                    <li className="flex text-lg items-center">
                        {userSelector.admin && (
                            <Link to="/adminpanel" className="text-blue-600 hover:text-blue-800">
                                Home
                            </Link>
                        )}
                        {userSelector.doctor && (
                            <Link to="/doctorpanel" className="text-blue-600 hover:text-blue-800">
                                Home
                            </Link>
                        )}
                    </li>
                    <li className="flex text-lg items-center mx-2 text-gray-500">
                        &gt;
                    </li>
                    <li className="flex text-lg items-center">
                        {userSelector.admin && (
                            <Link to="/searchpatient" className="text-blue-600 hover:text-blue-800">
                            Search Patient
                        </Link>
                        )
                        }
                        {userSelector.doctor && (
                            <Link to="/mypatients" className="text-blue-600 hover:text-blue-800">
                            My Patient
                        </Link>
                        )
                        }
                    </li>
                    <li className="flex text-lg items-center mx-2 text-gray-500">
                        &gt;
                    </li>
                    <li className="flex text-lg items-center">
                        <Link
                            to={{
                                pathname: '/editpatientdetails',
                                state: { patientId: patientId }
                            }}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Edit Details
                        </Link>
                    </li>
                </ol>
            </nav>
            <div className="flex flex-col md:flex-row bg-gray-100">
                <div className="md:w-1/3 hidden lg:flex flex-col items-center justify-center">
                    <img src="register.jpg" alt="register" className="w-45 h-45 object-cover" />
                </div>
                <div className="lg:w-2/3 w-full bg-white shadow-md rounded-xl p-3 max-w-4xl mx-auto mt-3 mr-5">
                    <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Edit Patient Details</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2">
                        <div className="ml-5 mr-5">
                            <CustomForm.Id
                                value={patientId}
                                placeholder="Patient Id"
                                name="id"
                                readOnly // Make ID read-only as it's not editable
                            />
                        </div>
                        <div className="ml-5 mr-5">
                            {formData.imageUrl && (
                                <img
                                    src={formData.imageUrl}
                                    alt="Patient"
                                    className="w-20 h-20 cursor-pointer border border-gray-400 rounded-xl mx-auto"
                                    onClick={triggerFileInput}
                                />
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                ref={fileInputRef}
                                className="hidden"
                                onChange={handleImageChange}
                            />
                        </div>
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
        </>
    );
};

export default EditPatientD;
