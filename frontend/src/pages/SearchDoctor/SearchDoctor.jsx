import "./SearchDoctor.css";
import { useState, useEffect } from "react";
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
        if (filtered.length === 0) {
            toast.error("No doctors found");
        } else {
            toast.success("Doctors found");
        }
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
            <div className="searchdoctor-container">
                <div className="search-bar">
                    <CustomForm>
                        <CustomForm.Search
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search for Doctors"
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    e.preventDefault(); // Prevent form submission
                                    submitSearch();
                                }
                            }}
                        />
                    </CustomForm>
                </div>
                <FormControl variant="outlined" style={{ minWidth: 120 }}>
                    <InputLabel>Doctors per page</InputLabel>
                    <Select
                        value={doctorsPerPage}
                        onChange={(e) => handleDoctorsPerPageChange(e)}
                        label="Doctors per page"
                    >
                        <MenuItem value={6}>6</MenuItem>
                        <MenuItem value={12}>12</MenuItem>
                        <MenuItem value={18}>18</MenuItem>
                    </Select>
                </FormControl>
            </div>

            {searchTerm && filteredDoctors.length > -1 && (
                <Typography variant="h6" style={{ margin: "20px 0" }}>
                    {filteredDoctors.length} {filteredDoctors.length === 1 ? "Doctor" : "Doctors"} Found
                </Typography>
            )}

            {currentDoctors.length > 0 && (
                <Grid container spacing={3} className="doctors-grid">
                    {currentDoctors.map((doctor) => (
                        <Grid item xs={12} sm={6} md={4} key={doctor.id} >
                            <Paper className="doctor-card" elevation={3} >
                                {doctor.imageUrl && (
                                    <img
                                        src={doctor.imageUrl}
                                        alt={`${doctor.username}'s profile`}
                                        className="doctor-image"
                                    />
                                )}
                                <Typography variant="h6" sx={{ fontWeight: "bold" }}>Doctor ID: {doctor.id}</Typography>
                                <Typography variant="body1">
                                    Name: {capitalizeFirstLetter(doctor.username.split(" ").slice(-1)[0])}
                                </Typography>
                                <Typography variant="body1">Email: {doctor.email}</Typography>
                                <Typography variant="body1">Phone: {doctor.phone}</Typography>
                                {userSelector.admin && (
                                    <>
                                        <Button
                                            value={selectedDoctorId === doctor.id ? "Close" : "Edit"}
                                            onClick={() => {
                                                setSelectedDoctorId(selectedDoctorId === doctor.id ? null : doctor.id);
                                                if (selectedDoctorId !== doctor.id) {
                                                    setUpdateEmail(doctor.email);
                                                    setUpdatePhone(doctor.phone);
                                                } else {
                                                    setUpdateEmail("");
                                                    setUpdatePhone("");
                                                }
                                            }}
                                        />{" "}
                                        <Button
                                            value="Set Availability"
                                      onClick={() => navigate('/addavailability', { state: { doctorId: doctor.id, doctorFName: doctor.firstName, doctorLName: doctor.lastName, imageUrl: doctor.imageUrl } })}

                                        />
                                    </>
                                )}
                                {selectedDoctorId === doctor.id && (
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
                                            <Button
                                                value="Update"
                                                onClick={(e) => updateContact(e, doctor.id)}
                                            />
                                        </CustomForm>
                                    </div>
                                )}
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

            )}

            <div className="flex justify-between items-center mt-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
                >
                    &lt; Previous
                </button>
                <span>
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
            <ToastContainer />
        </>
    );
};

export default SearchDoctor;
