import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { Grid, TextField, Button, Box, InputAdornment, FormControl, Select, MenuItem, Typography, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { ToastContainer, toast } from "react-toastify";
import CustomForm from "../../../components/CustomForm/CustomForm";
import { makeGETrequest } from "../../../utils/api";
import "react-toastify/dist/ReactToastify.css";
import { Link } from 'react-router-dom';

const MyPatients = () => {
    const [patients, setPatients] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredPatients, setFilteredPatients] = useState([]);
    const [selectedPatientId, setSelectedPatientId] = useState(null);
    const [updateEmail, setUpdateEmail] = useState("");
    const [updatePhone, setUpdatePhone] = useState("");
    const [medicalRecord, setMedicalRecord] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [patientsPerPage, setPatientsPerPage] = useState(6);
    const [appointmentId, setAppointmentId] = useState(""); // State for Appointment ID filter
    const [noPatientsMessage, setNoPatientsMessage] = useState(""); // State for no patients found message
    const navigate = useNavigate();
    const userSelector = useSelector((state) => state.user);

    useEffect(() => {
        async function fetchAllPatients() {
            try {
                const res = await makeGETrequest(
                    `http://localhost:5000/patients/mypatients?doctorId=${userSelector.id}`,
                    localStorage.getItem("token")
                );
    
                console.log(res); // Inspect the response
    
                if (res.status === 200) {
                    const patientsArray = Array.isArray(res.patients) ? res.patients : []; // Ensure it is an array
                    const patientWithImages = patientsArray.map(patient => ({
                        ...patient,
                        imageUrl: `data:${patient.image.contentType};base64,${patient.image.data}`
                    }));
                    console.log(patientWithImages)
                    setPatients(patientWithImages);
                    setFilteredPatients(patientWithImages);
                    console.log(patients)
                } else {
                    toast.error(res.message || "Failed to fetch patients");
                }
            } catch (error) {
                console.error("Error fetching patients:", error);
                toast.error("Failed to fetch patients. Please try again.");
            }
        }
    
        fetchAllPatients();
    }, [userSelector.id]);
    
    useEffect(() => {
        if (searchTerm.trim() !== "") {
            submitSearch();
        } else {
            setFilteredPatients(patients);
        }
    }, [searchTerm, patients]);

    const submitSearch = () => {
        // console.log(searchTerm)
        const filtered = patients.filter((patient) =>
            patient.id.toString().includes(searchTerm) ||
            patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            patient.phone.toString().includes(searchTerm)
        );
        setFilteredPatients(filtered);
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const handlePatientsPerPageChange = (event) => {
        setPatientsPerPage(event.target.value);
        setCurrentPage(1); // Reset to the first page when changing patients per page
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
            <nav className="flex py-3 px-5 bg-gray-100 rounded-md w-full">
                <ol className="list-reset flex text-grey-dark">
                    <li className="flex text-lg items-center">
                        <Link to="/doctorpanel" className="text-blue-600 hover:text-blue-800">
                            Home
                        </Link>
                    </li>
                    <li className="flex text-lg items-center mx-2 text-gray-500">
                        &gt;
                    </li>
                    <li className="flex text-lg items-center">
                        <Link to="/mypatients" className="text-blue-600 hover:text-blue-800">
                           My Patient
                        </Link>
                    </li>
                </ol>
            </nav>
            <Box sx={{ padding: 4 }}>
                <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                        <TextField
                            label="Search"
                            variant="outlined"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Id/Name/PhNo"
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault(); // Prevent form submission
                                    submitSearch();
                                }
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{
                                backgroundColor: 'white',
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                },
                            }}
                        />
                    </Grid>

                    {/* Pagination Controls */}
                    <Grid item xs={12} sm={4} className="pagination-controls flex justify-center items-center">
                        <Box sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                            <Button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                sx={{ px: 2, py: 1, backgroundColor: 'blue.300', color: 'gray.500', borderRadius: 1, '&:disabled': { opacity: 0.5 } }}
                            >
                                &lt; Previous
                            </Button>
                            <span style={{ margin: '0 16px' }}>
                                Page {currentPage} of {totalPages}
                            </span>
                            <Button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
                                sx={{ px: 2, py: 1, backgroundColor: 'blue.300', color: 'gray.500', borderRadius: 1, '&:disabled': { opacity: 0.5 } }}
                            >
                                Next &gt;
                            </Button>
                        </Box>
                    </Grid>

                    {/* Per Page */}
                    <Grid item xs={12} sm={4} className="flex justify-end w-full">
                        <Box className="flex items-center justify-end w-full">
                            <Typography variant="body1" component="label" className="px-4">
                                Patients Per Page
                            </Typography>
                        </Box>
                        <FormControl variant="outlined" className="w-32">
                            <Select
                                value={patientsPerPage}
                                onChange={handlePatientsPerPageChange}
                            >
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={12}>12</MenuItem>
                                <MenuItem value={18}>18</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <div className="mt-10">
                    {appointmentId && filteredPatients.length > 0 && (
                        <Typography variant="h6" style={{ margin: "20px 0" }}>
                            {filteredPatients.length} {filteredPatients.length === 1 ? "Patient" : "Patients"} Found
                        </Typography>
                    )}
                    {noPatientsMessage && (
                        <Typography variant="h6" color="error" style={{ margin: "20px 0" }}>
                            {noPatientsMessage}
                        </Typography>
                    )}
                    {currentPatients.length > 0 && (
                        <Grid container spacing={3} className="patients-grid">
                            {currentPatients.map((patient) => (
                                <Grid item xs={12} sm={6} md={6} lg={4} key={patient.id}>
                                    <Paper className="bg-white shadow-lg rounded-lg p-4" elevation={3}>
                                        <div className="flex items-start">
                                            {patient.imageUrl && (
                                                <img
                                                    src={patient.imageUrl}
                                                    alt={`${patient.firstName}'s profile`}
                                                    className="w-16 h-16 rounded-full mr-4"
                                                />
                                            )}
                                            <div className="flex-1 ml-4">
                                                <Typography variant="h6" className="text-lg font-semibold text-gray-700 mb-2">
                                                    {capitalizeFirstLetter(patient.firstName.split(" ").slice(-1)[0])} {patient.lastName}
                                                </Typography>
                                                <Typography className="text-gray-700 text-xl font-semibold mb-2">
                                                    ID: {patient.id}
                                                </Typography>
                                                <Typography variant="body1" className="text-gray-700 mb-2">
                                                    {patient.email}
                                                </Typography>
                                                <Typography variant="body1" className="text-gray-700 mb-3">
                                                    Ph No: {patient.phone}
                                                </Typography>
                                     
                                                {userSelector.doctor && (
                                                    <Box className="flex mt-4 space-x-4">
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => navigate('/editpatientdetails',{state :{patientId:patient.id}})}
                                                            // onClick={()=>navigate(`/editpatientdetails?${patient.id}`)}
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => navigate(`/addmedicalrecord`,{state :{patientId:patient.id}})}
                                                        >
                                                            Add Medical Record
                                                        </Button>
                                                    </Box>
                                                )}
                                                {selectedPatientId === patient.id && userSelector.admin && (
                                                    <div className="mt-4">
                                                        <h3 className="text-lg font-semibold mb-2">Update Contact Information</h3>
                                                        <CustomForm>
                                                            <TextField
                                                                label="Email"
                                                                value={updateEmail}
                                                                onChange={(e) => setUpdateEmail(e.target.value)}
                                                                fullWidth
                                                                margin="normal"
                                                                className="mb-2"
                                                            />
                                                            <TextField
                                                                label="Phone"
                                                                value={updatePhone}
                                                                onChange={(e) => setUpdatePhone(e.target.value)}
                                                                fullWidth
                                                                margin="normal"
                                                                className="mb-2"
                                                            />
                                                            <Button onClick={updateContact} className="bg-indigo-500 text-white hover:bg-indigo-600 rounded px-4 py-2">
                                                                Update
                                                            </Button>
                                                        </CustomForm>
                                                    </div>
                                                )}
                                                {selectedPatientId === patient.id && userSelector.doctor && (
                                                    <div className="mt-4">
                                                        <h3 className="text-lg font-semibold mb-2">Add Medical Record</h3>
                                                        <CustomForm>
                                                            <TextField
                                                                label="Medical Record"
                                                                value={medicalRecord}
                                                                onChange={(e) => setMedicalRecord(e.target.value)}
                                                                fullWidth
                                                                margin="normal"
                                                                className="mb-2"
                                                            />
                                                            <Button onClick={submitMedicalRecord} className="bg-blue-600 text-white hover:bg-blue-700 rounded px-4 py-2">
                                                                Add Record
                                                            </Button>
                                                        </CustomForm>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                    <ToastContainer />
                </div>
            </Box>
        </>
    );
};

export default MyPatients;
