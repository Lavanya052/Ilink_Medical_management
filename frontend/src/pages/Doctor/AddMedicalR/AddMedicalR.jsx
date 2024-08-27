import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { makeGETrequest, makePOSTreqForm } from "../../../utils/api";
import CustomForm from "../../../components/CustomForm/CustomForm";
import Button from "../../../components/Button/Button";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { Link } from 'react-router-dom';

const AddMedicalR = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const userSelector = useSelector((state) => state.user);
    const [formData, setFormData] = useState({
       title:"",
       description:""
    });

    // Extract patientId from location state or default to empty string
    const { patientId } = location.state || { patientId: '' };

    // State to hold patient details
    const [patientDetails, setPatientDetails] = useState({
        fname: '',
        lname: '',
        image: '',
    });

    // Fetch patient data to verify patient ID and get patient details
    useEffect(() => {
        const fetchPatientData = async () => {
            try {
                const res = await makeGETrequest(
                    `http://localhost:5000/patients/getpatientDetails?id=${patientId}`,
                    localStorage.getItem("token")
                );
                if (!res.patient) {
                    toast.error('Patient not found.');
                    navigate('/searchpatient');
                } else {
                    setPatientDetails({
                        fname: res.patient.firstName,
                        lname: res.patient.lastName,
                        image: res.patient.image
                            ? `data:${res.patient.image.contentType};base64,${res.patient.image.data}`
                            : ''
                    });
                }
            } catch (error) {
                console.error('Error fetching patient data', error);
                toast.error('Failed to fetch patient details.');
            }
        };

        if (patientId) {
            fetchPatientData();
        }
    }, [patientId, navigate]);

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
    
        const formPayload = new FormData();
        // const timestamp = new Date().toISOString();
    
        
        formPayload.append("data", JSON.stringify({
            title:formData.title,
            description:formData.description,
            id:patientId,
            doctorId:userSelector.id
            // timestamp,
            
        }));

        try {
            const res = await makePOSTreqForm(
                "http://localhost:5000/patients/addmedicalrecord",
                formPayload,
                localStorage.getItem("token")
            );
    
            if (res.status === 200 || res.status === 201) {
                toast.success(res.message);
                setTimeout(() => {
                    navigate("/addmedicalrecord", { state: { patientId } });
                }, 2000);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error('Error adding medical record', error);
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
                        <Link to="/mypatients" className="text-blue-600 hover:text-blue-800">
                            My Patient
                        </Link>
                    </li>
                    <li className="flex text-lg items-center mx-2 text-gray-500">
                        &gt;
                    </li>
                    <li className="flex text-lg items-center">
                        <Link
                            to={{
                                pathname: '/addmedicalrecord',
                                state: { patientId }
                            }}
                            className="text-blue-600 hover:text-blue-800"
                        >
                            Add Medical Record
                        </Link>
                    </li>
                </ol>
            </nav>
            <div className="flex flex-col md:flex-row bg-gray-100 mt-9  ">
                <div className="md:w-1/3 hidden lg:flex flex-col items-center justify-center">
                    <img src="medicalrecord.png" alt="medical record" className="w-45 h-45 object-cover" />
                </div>
                <div className="lg:w-2/3 w-full bg-white shadow-md rounded-xl pt-4 pl-4 pr-4 pb-2 ml-5 max-w-4xl mx-auto mr-5">
                    <h2 className="text-3xl font-bold mb-3 text-center text-blue-600">Add Medical Record</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2">
                        <div className="ml-5 mr-5">
                            <CustomForm.Id
                                value={patientId}
                                placeholder="Patient Id"
                                name="id"
                                readOnly
                            />
                        </div>
                        <div className="ml-5 mr-5">
                            {patientDetails.image && (
                                <img
                                    src={patientDetails.image}
                                    alt={patientDetails.fname}
                                    className="w-20 h-20 object-cover rounded-full mx-auto"
                                />
                            )}
                        </div>
                        <div className="ml-5 mr-5">
                            <CustomForm.Input
                                value={`${patientDetails.fname} ${patientDetails.lname}`}
                                placeholder="Patient Name"
                                name="name"
                                readOnly
                            />
                        </div>
                        <div className="ml-5 mr-5">
                            <CustomForm.Input
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Problem"
                                name="title" // This should match the name being checked in handleChange
                            />
                        </div>
                        <div className="ml-5 mr-5 col-span-2">
                            <CustomForm.MedicalRecord
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Description"
                                name="description" // This should match the name being checked in handleChange
                                multiline
                                rows={4}
                            />
                        </div>

                        <div className="col-span-2 flex justify-end">
                            <Button value={"Add Record"} type="submit" />
                        </div>
                    </form>
                    <ToastContainer />
                </div>
            </div>
        </>
    );
};

export default AddMedicalR;
