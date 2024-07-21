import "./SearchResult.css";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { makeGETrequest } from "../../utils/api";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Button
} from "@mui/material";

const SearchResult = () => {
    const [doctors, setDoctors] = useState([]);
    const userSelector = useSelector((state) => state.user);
    const location = useLocation();
    const searchTerm = new URLSearchParams(location.search).get("id");
    const [doctorCount, setDoctorCount] = useState(0);
    useEffect(() => {
        if (searchTerm) {
            async function fetchSearchResults() {
                const url = new URL("http://localhost:5000/doctors/searchdoctor");

                if (/^[\d{4}]+$/.test(searchTerm)) {
                    
                    url.searchParams.append("id", `${searchTerm}`);
                } else if (searchTerm.match(/^D\d+$/)) {
                   
                    url.searchParams.append("id", searchTerm);
                } else {
                    
                    url.searchParams.append("username", searchTerm);
                }

                try {
                    const res = await makeGETrequest(url.toString());

                    if (res.doctors) {
                        const doctorsWithImages = res.doctors.map(doctor => {
                            const imageUrl = `data:${doctor.image.contentType};base64,${doctor.image.Image}`;
                            return {
                                ...doctor,
                                imageUrl: imageUrl
                            };
                        });
                        setDoctors(res.doctors); 
                        setDoctorCount(doctorsWithImages.length);
                        toast.success(res.message);
                    } else {
                        setDoctors([]);
                        setDoctorCount(0);
                        toast.error(res.message);
                    }
                } catch (error) {
                    console.error("Error fetching search results:", error);
                    toast.error("Failed to fetch search results");
                }
            }

            fetchSearchResults();
        }
    }, [searchTerm]);

    const capitalizeFirstLetter = (string) => {
        return string.charAt(0).toUpperCase() + string.slice(1);
    };

    return (
        <>
            <div>
                <h2>Doctor Results</h2>
                <Typography variant="h5" gutterBottom sx={{ marginBottom: "30px" }}>
                     {doctorCount} search result found
                </Typography>
                {doctors && doctors.length > 0 && (
                    
                    <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ textAlign: "center" }}>Doctor ID</TableCell>
                                <TableCell sx={{ textAlign: "center" }}>Name</TableCell>
                                <TableCell sx={{ textAlign: "center" }}>Email</TableCell>
                                <TableCell sx={{ textAlign: "center" }}>Phone</TableCell>
                                <TableCell sx={{ textAlign: "center" }}>Image</TableCell>
                                {userSelector.admin && <TableCell sx={{ textAlign: "center" }}>Action</TableCell>}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {doctors.map((doctor) => (
                                <TableRow key={doctor.id}>
                                    <TableCell sx={{ textAlign: "center" }}>{doctor.id}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{capitalizeFirstLetter(doctor.username.split(' ').slice(-1)[0])}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{doctor.email}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>{doctor.phone}</TableCell>
                                    <TableCell sx={{ textAlign: "center" }}>
                                        {doctor.imageUrl && (
                                            <img src={doctor.imageUrl} alt={`${doctor.username}'s profile`} className="doctor-image" />
                                        )}
                                    </TableCell>
                                    {userSelector.admin && (
                                        <TableCell sx={{ textAlign: "center" }}>
                                            <Button onClick={() => {
                                                setSelectedDoctor(doctor);
                                                setShowUpdate(!showUpdate);
                                            }}>
                                                Update
                                            </Button>
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                
                )}
                {doctors && doctors.length === 0 && <Typography>No doctors found</Typography>}
            </div>
            <ToastContainer />
        </>
    );
}

export default SearchResult;
