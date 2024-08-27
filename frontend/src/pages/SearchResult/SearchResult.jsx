import "./SearchResult.css";
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { useLocation } from "react-router-dom";
import { makeGETrequest } from "../../utils/api";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Grid, TextField, Button, Box, InputAdornment, FormControl, Select, MenuItem, InputLabel, Typography, Paper } from '@mui/material';

const SearchResult = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const userSelector = useSelector((state) => state.user);
    const location = useLocation();
    const searchTerm = new URLSearchParams(location.search).get("id");
    const [doctorCount, setDoctorCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [doctorsPerPage] = useState(6);
    const navigate = useNavigate();

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
                        // toast.success(res.message);
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

    const indexOfLastDoctor = currentPage * doctorsPerPage;
    const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
    const currentDoctors = doctors.slice(indexOfFirstDoctor, indexOfLastDoctor);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);
    return (
        <>
            <div className="container mx-auto p-4">
                <h2 className="text-3xl font-semibold mb-4 text-blue-500">Doctor Results</h2>
                {loading ? (
                    <div className="flex justify-center items-center">
                        <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {currentDoctors.length > 0 ? (
                            <div className="overflow-x-auto">
                                 <div className="flex justify-center mb-4">
                                    <nav>
                                        <ul className="inline-flex">
                                            {[...Array(Math.ceil(doctors.length / doctorsPerPage)).keys()].map(number => (
                                                <li key={number} className={`px-4 py-2 ${currentPage === number + 1 ? 'bg-blue-500 text-white' : 'bg-white text-blue-500'} border cursor-pointer`} onClick={() => paginate(number + 1)}>
                                                    {number + 1}
                                                </li>
                                            ))}
                                        </ul>
                                    </nav>
                                </div>
                               
                                <p className="text-lg mb-6">{doctorCount} search result{doctorCount !== 1 ? 's' : ''} found</p>
                                <table className="min-w-full bg-white border">
                                    <thead>
                                        <tr>
                                            <th className="py-2 px-4 border">Doctor ID</th>
                                            <th className="py-2 px-4 border">Name</th>
                                            <th className="py-2 px-4 border">Email</th>
                                            <th className="py-2 px-4 border">Phone</th>
                                            <th className="py-2 px-4 border">Image</th>
                                            {userSelector.admin && <th className="py-2 px-4 border">Action</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentDoctors.map((doctor) => (
                                            <tr key={doctor.id} className="text-center">
                                                <td className="py-2 px-4 border">{doctor.id}</td>
                                                <td className="py-2 px-4 border">{capitalizeFirstLetter(doctor.username.split(' ').slice(-1)[0])}</td>
                                                <td className="py-2 px-4 border">{doctor.email}</td>
                                                <td className="py-2 px-4 border">{doctor.phone}</td>
                                                <td className="py-2 px-4 border">
                                                    {doctor.imageUrl && (
                                                        <img src={doctor.imageUrl} alt={`${doctor.username}'s profile`} className="doctor-image w-12 h-12 object-cover rounded-full mx-auto" />
                                                    )}
                                                </td>
                                                {userSelector.admin && (
                                                    <td className="py-2 px-4 border">
                                                        <Button
                                                            variant="outlined"
                                                            color="primary"
                                                            onClick={() => navigate(`/editdoctordetails`,{state :{doctorId:doctor.id}})}

                                                        >
                                                            Upadate
                                                        </Button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                               
                            </div>
                        ) : (
                            <p>No doctors found</p>
                        )}
                    </>
                )}
            </div>
            <ToastContainer />
        </>
    );
};

export default SearchResult;
