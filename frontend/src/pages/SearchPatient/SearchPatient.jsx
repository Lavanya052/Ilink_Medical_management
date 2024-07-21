import { useState, useEffect } from "react";
import "./SearchPatient.css";
import { useNavigate } from 'react-router-dom';
import CustomForm from "../../components/CustomForm/CustomForm";
import Button from "../../components/Button/Button";
import { makeGETrequest, makePOSTrequest } from "../../utils/api";
import { useSelector } from "react-redux";
import {
    Grid,
    TextField,
    Paper,
    Typography,
    Button as MuiButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel
} from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const SearchPatient = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [updateEmail, setUpdateEmail] = useState("");
    const [updatePhone, setUpdatePhone] = useState("");
    const [medicalRecord, setMedicalRecord] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [patientsPerPage, setPatientsPerPage] = useState(6);
    const navigate = useNavigate();
    const userSelector = useSelector((state) => state.user);
    useEffect(() => {
        async function fetchAllPatients() {
            try {
                const res = await makeGETrequest("http://localhost:5000/patients/allpatients");
                if (res.patients) {

                    const patientWithImages = res.patients.map((patient) => ({
                        ...patient,
                         imageUrl: `data:${patient.image.contentType};base64,${patient.image.data}`
                    }));
                    setPatients(patientWithImages);
                    setFilteredPatients(patientWithImages);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error("Error fetching patients:", error);
                toast.error("Failed to fetch patients. Please try again.");
            }
        }
        fetchAllPatients();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() !== "") {
            submitSearch();
        } else {

            setFilteredPatients(patients);
        }
    }, [searchTerm, patients]);


    const submitSearch = () => {
        const filtered = patients.filter((patient) =>
            patient.id.toString().includes(searchTerm) ||
            (patient.username && patient.username.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        setFilteredPatients(filtered);
        if (filtered.length === 0) {
            //toast.error("No Ptient found");
        } else {
            //toast.success("Patient found");
        }
    };
    async function updateContact(e) {
        e.preventDefault();

        if (!/\S+@\S+\.\S+/.test(updateEmail)) {
            toast.error("Invalid email address");
            return;
        }
        if (!/^[0-9-+]+$/.test(updatePhone)) {
            toast.error("Invalid phone number");
            return;
        }

        try {
            const res = await makePOSTrequest("http://localhost:5000/patients/updatepatient", {
                id: selectedPatientId,
                email: updateEmail,
                phone: updatePhone
            },
                localStorage.getItem("token"));
            if (res.status === 201) {
                setUpdateEmail("");
                setUpdatePhone("");
                setSelectedPatientId(null);
                const updatedPatient = JSON.parse(res.patient);
                setPatients(patients.map(pat => pat.id === selectedPatientId ? updatedPatient : pat));
                // toast.success(res.message);
            } else {
                // toast.error(res.message);
            }
        } catch (error) {
            console.error("Error updating contact:", error);
            toast.error("Failed to update contact information");
        }
    }
    async function submitMedicalRecord(e) {
        e.preventDefault();

        try {
            const res = await makePOSTrequest("http://localhost:5000/patients/addmedicalrecord", {
                medicalRecord: medicalRecord,
                id: selectedPatientId
            },
                localStorage.getItem("token"));
            if (res.status === 201) {
                setMedicalRecord("");
                const updatedPatient = JSON.parse(res.patient);
                setPatients(patients.map(pat => pat.id === selectedPatientId ? updatedPatient : pat));
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error("Error adding medical record:", error);
            toast.error("Failed to add medical record");
        }
    }




    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const handlePatientsPerPageChange = (event) => {
        setPatientsPerPage(event.target.value);
        setCurrentPage(1); // Reset to the first page when changing doctors per page
    };
    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };
    const handleNextPage = () => {
        const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };
    const indexOfLastPatient = currentPage * patientsPerPage;
    const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
    const currentPatients = filteredPatients.slice(indexOfFirstPatient, indexOfLastPatient);
    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

    return (
        <>

            <div className="grid grid-cols-3 gap-4 mt-5 mb-10">

                <div className="search-bar flex justify-center items-center ">
                    <CustomForm>
                        <CustomForm.Search
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for Patients"
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault(); // Prevent form submission
                                    submitSearch();
                                }
                            }}
                        />
                    </CustomForm>
                </div>

                <div className="pagination-controls flex justify-center items-center">
                    <button
                        onClick={handlePreviousPage}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                    >
                        &lt; Previous
                    </button>
                    <span className="mx-4">
                        Page {currentPage} of {totalPages}
                    </span>
                    <button
                        onClick={handleNextPage}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                    >
                        Next &gt;
                    </button>
                </div>

                <div className="patients-per-page ">
                    <FormControl variant="outlined" style={{ minWidth: 120 }}>
                        <InputLabel>Patients per page</InputLabel>
                        <Select
                            value={patientsPerPage}
                            onChange={(e) => handlePatientsPerPageChange(e)}
                            label="Patients per page"
                        >
                            <MenuItem value={6}>6</MenuItem>
                            <MenuItem value={12}>12</MenuItem>
                            <MenuItem value={18}>18</MenuItem>
                        </Select>
                    </FormControl>
                </div>

            </div>
            <div className="pr-5 pl-5">
                {searchTerm && filteredPatients.length > -1 && (
                    <Typography variant="h6" style={{ margin: "20px 0" }}>
                        {filteredPatients.length} {filteredPatients.length === 1 ? "Patient" : "Patients"} Found
                    </Typography>
                )}
                {currentPatients.length > 0 && (
                    <Grid container spacing={3} className="patients-grid">
                        {currentPatients.map((patient) => (
                            <Grid item xs={12} sm={6} md={4} key={patient.id}>
                                <Paper className="patient-card" elevation={3}>
                                {patient.imageUrl && (
                                    <img
                                        src={patient.imageUrl}
                                        alt={`${patient.firstName}'s profile`}
                                        className="doctor-image"
                                    />
                                )}
                                    <Typography variant="h6">Patient ID: {patient.id}</Typography>
                                    {/* <Typography variant="body1"><strong>Name:</strong> {capitalizeFirstLetter(patient.username)}</Typography> */}
                                    <Typography variant="body1"><strong>Email:</strong> {patient.email}</Typography>
                                    {userSelector.doctor && (
                                        <Button
                                            value={selectedPatientId === patient.id ? "Close" : "Add Record"}
                                            onClick={() => {
                                                setSelectedPatientId(selectedPatientId === patient.id ? null : patient.id);
                                                setMedicalRecord("");
                                            }}
                                        />
                                    )}
                                    {userSelector.admin && (<>
                                        <Button
                                            value={selectedPatientId === patient.id ? "Close" : "Edit"}
                                            onClick={() => {
                                                setSelectedPatientId(selectedPatientId === patient.id ? null : patient.id);
                                                if (selectedPatientId !== patient.id) {
                                                    setUpdateEmail(patient.email);
                                                    setUpdatePhone(patient.phone);
                                                } else {
                                                    setUpdateEmail("");
                                                    setUpdatePhone("");
                                                }
                                            }}
                                        />
                                        <Button
                                            value="Book appoinment"
                                            onClick={() => navigate('/appointmentbooking', { state: { patientId: patient.id, patientFName: patient.firstName, patientLName: patient.lastName, patientphone: patient.phone, } })}

                                        />
                                    </>
                                    )}
                                    {selectedPatientId === patient.id && userSelector.admin && (
                                        <div style={{ marginTop: "20px" }}>
                                            <h3>Update Contact Information</h3>
                                            <CustomForm>
                                                <TextField
                                                    label="Email"
                                                    value={updateEmail}
                                                    onChange={(e) => setUpdateEmail(e.target.value)}
                                                    fullWidth
                                                    margin="normal"
                                                />
                                                <TextField
                                                    label="Phone"
                                                    value={updatePhone}
                                                    onChange={(e) => setUpdatePhone(e.target.value)}
                                                    fullWidth
                                                    margin="normal"
                                                />
                                                <Button value="Update" onClick={updateContact} />
                                            </CustomForm>
                                        </div>
                                    )}
                                    {selectedPatientId === patient.id && userSelector.doctor && (
                                        <div style={{ marginTop: "20px" }}>
                                            <h3>Add Medical Record</h3>
                                            <CustomForm>
                                                <TextField
                                                    label="Medical Record"
                                                    value={medicalRecord}
                                                    onChange={(e) => setMedicalRecord(e.target.value)}
                                                    fullWidth
                                                    margin="normal"
                                                />
                                                <Button value="Add Record" onClick={submitMedicalRecord} />
                                            </CustomForm>
                                        </div>
                                    )}
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
               

                <ToastContainer />
            </div>
        </>
    );
}
export default SearchPatient;
