import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { makeGETrequest, makePOSTreqForm } from "../../utils/api";
import CustomForm from "../../components/CustomForm/CustomForm";
import Button from "../../components/Button/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';

const EditDoctorD = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const userSelector = useSelector((state) => state.user);

    const { doctorId } = location.state || { doctorId: '' };

    const [formData, setFormData] = useState({
        id: '',
        email: '',
        username: '',
        phone: '',
        emergencyPhone: '',
        firstName: '',
        lastName: '',
        address: '',
        speciality: '',
        gender: '',
        imageUrl: '',
        imageFile: null
    });

    const specialtyOptions = [
        { value: "cardiology", label: "Cardiology" },
        { value: "neurology", label: "Neurology" },
        { value: "dermatology", label: "Dermatology" },
        { value: "orthopedics", label: "Orthopedics" },
    ];

    useEffect(() => {
        const fetchDoctorData = async () => {
            try {
                const res = await makeGETrequest(
                    `http://localhost:5000/doctors/getdoctorDetails?id=${doctorId}`,
                    localStorage.getItem("token")
                );
                if (res.doctor) {
                    const doctorData = {
                        ...res.doctor,
                        imageUrl: res.doctor.image
                            ? `data:${res.doctor.image.contentType};base64,${res.doctor.image.data}`
                            : ''
                    };
                    setFormData(doctorData);
                }
            } catch (error) {
                console.error('Error fetching doctor data', error);
                toast.error('Failed to fetch doctor details.');
            }
        };

        if (doctorId) {
            fetchDoctorData();
        }
    }, [doctorId]);

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

        formPayload.append("data", JSON.stringify({
            id: doctorId,
            email: formData.email,
            username: formData.username,
            phone: formData.phone,
            emergencyPhone: formData.emergencyPhone,
            firstName: formData.firstName,
            lastName: formData.lastName,
            address: formData.address,
            speciality: formData.speciality, // Ensure the updated specialty is included
            gender: formData.gender
        }));

        try {
            const res = await makePOSTreqForm(
                "http://localhost:5000/doctors/editdoctor",
                formPayload,
                localStorage.getItem("token")
            );

            if (res.status === 201) {
                toast.success(res.message);
                setTimeout(() => {
                    navigate("/searchdoctor");
                }, 2000);
            } else {
                toast.error(res.message);
                setTimeout(() => {
                    navigate("/editdoctordetails", { state: { doctorId: doctorId } });
                }, 2000);
            }
        } catch (error) {
            console.error('Error updating doctor details', error);
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
                        <Link to="/searchdoctor" className="text-blue-600 hover:text-blue-800">
                            Search Doctor
                        </Link>
                    </li>
                    <li className="flex text-lg items-center mx-2 text-gray-500">
                        &gt;
                    </li>
                    <li className="flex text-lg items-center">
                        <Link
                            to={{
                                pathname: '/editdoctor',
                                state: { doctorId: doctorId }
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
                <div className="lg:w-2/3 w-full bg-white shadow-md rounded-xl p-6 max-w-4xl mx-auto mt-1 mr-5">
                    <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Edit Doctor Details</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2">
                        <div className="ml-5 mr-5">
                            <CustomForm.Id
                                value={doctorId}
                                placeholder="Doctor Id"
                                name="id"
                                readOnly
                            />
                        </div>
                        <div className="ml-5 mr-5">
                            {formData.imageUrl && (
                                <img
                                    src={formData.imageUrl}
                                    alt="Doctor"
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
                            <CustomForm.Options
                                value={formData.speciality}    // Bind to the form data state
                                onChange={handleChange}        // Handle state update
                                Options={specialtyOptions}    // Options for the dropdown
                                placeholder="Speciality"
                                name="speciality"              // This should match the state property
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
                            <CustomForm.Phone
                                value={formData.emergencyPhone}
                                onChange={handleChange}
                                placeholder="Emergency No"
                                name="phone2"
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
                            <CustomForm.Gender
                                value={formData.gender}
                                onChange={handleChange}
                                placeholder="Gender"
                                name="gender"
                            />
                        </div>
                        <div className="col-span-2 flex justify-end">
                            <Button value={"Save"} type="submit" />
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer />
        </>
    );
};

export default EditDoctorD;
