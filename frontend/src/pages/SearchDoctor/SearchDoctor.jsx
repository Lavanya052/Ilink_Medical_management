import "./SearchDoctor.css";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { makeGETrequest, makePOSTrequest } from "../../utils/api";
import { useSelector } from "react-redux";
import {
    Grid, TextField, Button, Box, InputAdornment, FormControl, Select, MenuItem, InputLabel, Typography, Paper
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa'

const SearchDoctor = () => {
    const [allDoctors, setAllDoctors] = useState([]);
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDoctorId, setSelectedDoctorId] = useState(null);
    const [updateEmail, setUpdateEmail] = useState("");
    const [updatePhone, setUpdatePhone] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [doctorsPerPage, setDoctorsPerPage] = useState(6);
    const userSelector = useSelector((state) => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchAllDoctors() {
            try {
                const res = await makeGETrequest("http://localhost:5000/doctors/alldoctors");
                if (res.doctors) {
                    const doctorsWithImages = res.doctors.map((doctor) => ({
                        ...doctor,
                        imageUrl: `data:${doctor.image.contentType};base64,${doctor.image.data}`
                    }));
                    setAllDoctors(doctorsWithImages);
                    setFilteredDoctors(doctorsWithImages);
                } else {
                    toast.error(res.message);
                }
            } catch (error) {
                console.error("Error fetching doctors:", error);
                toast.error("Failed to fetch doctors. Please try again.");
            }
        }
        fetchAllDoctors();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() !== "") {
            submitSearch();
        } else {
            setFilteredDoctors(allDoctors);
        }
    }, [searchTerm, allDoctors]);

    const submitSearch = () => {
        const filtered = allDoctors.filter((doctor) =>
            doctor.id.toString().includes(searchTerm) ||
            doctor.username.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredDoctors(filtered);
    };

    const updateContact = async (e, doctorId) => {
        e.preventDefault();
        try {
            if (!/\S+@\S+\.\S+/.test(updateEmail)) {
                toast.error("Invalid email address");
                return;
            }
            if (!/^[0-9-+]+$/.test(updatePhone)) {
                toast.error("Invalid phone number");
                return;
            }
            const res = await makePOSTrequest(
                "http://localhost:5000/doctors/updatedoctor",
                {
                    id: doctorId,
                    email: updateEmail,
                    phone: updatePhone
                },
                localStorage.getItem("token")
            );
            if (res.status === 201) {
                const updatedDoctor = JSON.parse(res.doctor);
                setAllDoctors((prevDoctors) =>
                    prevDoctors.map((doc) => (doc.id === doctorId ? updatedDoctor : doc))
                );
                setFilteredDoctors((prevFiltered) =>
                    prevFiltered.map((doc) => (doc.id === doctorId ? updatedDoctor : doc))
                );
                setUpdateEmail("");
                setUpdatePhone("");
                setSelectedDoctorId(null);
                toast.success(res.message);
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            console.error("Error updating contact:", error);
            toast.error("Failed to update contact. Please try again.");
        }
    };

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    const handleDoctorsPerPageChange = (event) => {
        setDoctorsPerPage(event.target.value);
        setCurrentPage(1); // Reset to the first page when changing doctors per page
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    const indexOfLastDoctor = currentPage * doctorsPerPage;
    const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
    const currentDoctors = filteredDoctors.slice(indexOfFirstDoctor, indexOfLastDoctor);
    const totalPages = Math.ceil(filteredDoctors.length / doctorsPerPage);

    return (
        <>
            <nav className="flex py-3 px-5 bg-gray-100 rounded-md w-full items-center justify-between">
                <ol className="list-reset flex text-grey-dark">
                    <li className="flex text-lg items-center">
                        <Link to="/adminpanel" className="text-blue-600 hover:text-blue-800">
                            Home
                        </Link>
                    </li>
                    <li className="flex text-lg items-center mx-2 text-gray-500">
                        &gt;
                    </li>
                    <li className="flex text-lg items-center">
                        <Link to="/searchdoctor" className="text-blue-600 hover:text-blue-800">
                            Search Doctor
                        </Link>
                    </li>
                </ol>
                {/* <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center">
    <FaPlus className="mr-2" />
    Add Doctor
  </button> */}
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
                            placeholder="Search for Doctors"
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
                    <Grid item xs={12} sm={4} className="flex justify-center items-center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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
                    <Grid item xs={12} sm={4} className="flex justify-end items-center">

                        <Box className="flex items-center justify-end w-full">
                            <Typography variant="body1" component="label" className="px-4">
                                Doctors Per Page
                            </Typography>
                        </Box>
                        <FormControl variant="outlined" className="w-32">
                            <Select
                                value={doctorsPerPage}
                                onChange={handleDoctorsPerPageChange}
                            >
                                <MenuItem value={6}>6</MenuItem>
                                <MenuItem value={12}>12</MenuItem>
                                <MenuItem value={18}>18</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
                <div className="mt-10">
                    {searchTerm && filteredDoctors.length > -1 && (
                        <Typography variant="h6" style={{ margin: "20px 0" }}>
                            {filteredDoctors.length} {filteredDoctors.length === 1 ? "Doctor" : "Doctors"} Found
                        </Typography>
                    )}
                    {currentDoctors.length > 0 && (
                        <Grid container spacing={3} className="doctors-grid">
                            {currentDoctors.map((doctor) => (
                                <Grid item xs={12} sm={6} md={6} lg={4} key={doctor.id}>
                                    <Paper className="bg-white shadow-lg rounded-lg p-4" elevation={3}>
                                        <div className="flex items-start">
                                            {doctor.imageUrl && (
                                                <img
                                                    src={doctor.imageUrl}
                                                    alt={`${doctor.firstName}'s profile`}
                                                    className="w-16 h-16 rounded-full md:mr-4"
                                                />
                                            )}
                                            <div className="flex-1 ml-4">
                                                <Typography variant="h6" className="text-lg font-semibold text-gray-700 mb-2">
                                                    Dr.{capitalizeFirstLetter(doctor.firstName.split(" ").slice(-1)[0])} {doctor.lastName}
                                                </Typography>
                                                <Typography className="text-gray-700 text-xl font-semibold mb-2">
                                                    ID:{doctor.id}
                                                </Typography>
                                                <Typography variant="body1" className="text-gray-700 mb-2">
                                                    {doctor.email}
                                                </Typography>
                                                <Typography variant="body1" className="text-gray-700 mb-3">
                                                    Ph.No:{doctor.phone}
                                                </Typography>
                                                {userSelector.admin && (
                                                    <Box className="flex  mt-4 space-x-4">
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => navigate(`/doctor-profile/${doctor.id}`)}

                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => navigate('/addavailability', { state: { doctorId: doctor.id, doctorFName: doctor.firstName, doctorLName: doctor.lastName, imageUrl: doctor.imageUrl } })}
                                                        >
                                                            Set Availability
                                                        </Button>
                                                    </Box>
                                                )}
                                                {selectedDoctorId === doctor.id && (
                                                    <div style={{ marginTop: "20px" }}>
                                                        <h3 className="text-lg font-semibold mb-2">Update Contact Information</h3>
                                                        <form>
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
                                                            <Button
                                                                value="Update"
                                                                onClick={(e) => updateContact(e, doctor.id)}
                                                                className="bg-indigo-500 text-white hover:bg-indigo-600 rounded px-4 py-2"
                                                            >
                                                                Update
                                                            </Button>
                                                        </form>
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

export default SearchDoctor;
