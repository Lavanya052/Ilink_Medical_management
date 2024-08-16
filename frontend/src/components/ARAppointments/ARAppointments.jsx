import React, { useState, useEffect } from 'react';
import { makeGETrequest, makePOSTrequest } from '../../utils/api';
import { useSelector } from 'react-redux';
import { format, addMinutes } from 'date-fns';
import { FaGreaterThan, FaLessThan } from "react-icons/fa6";

const ARAppointment = () => {
    const [appointments, setAppointments] = useState([]); // Initialize as an empty array
    const [loading, setLoading] = useState(false);
    const user = useSelector((state) => state.user);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 2;

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await makeGETrequest(`http://localhost:5000/appointments/pending-appointments?doctorId=${user.id}`);
            // console.log(res)
            setAppointments(res.appointments || []); // Ensure appointments is always an array
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchAppointments();
    }, [user.id]);

    const getSortedAppointments = () => {
        if (!appointments || appointments.length === 0) {
            return []; // Return an empty array if no appointments
        }

        const sortedAppointments = appointments.map(appointment => {
            const imageUrl = `data:${appointment.image.contentType};base64,${appointment.image.data}`;
            return {
                ...appointment,
                imageUrl
            };
        });

        return sortedAppointments.sort((a, b) => {
            const dateComparison = new Date(a.date) - new Date(b.date);
            if (dateComparison !== 0) return dateComparison;
            return new Date(`1970-01-01T${a.time}:00Z`) - new Date(`1970-01-01T${b.time}:00Z`);
        });
    };

    const handleApproval = async (status, date, time) => {
        try {
            const res = await makePOSTrequest(`http://localhost:5000/appointments/doctorstatus`, {
                doctorId: user.id,  
                status,
                date,               
                startTime: time     
            }, localStorage.getItem("token"));
            fetchAppointments();
            // window.refresh()
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };
    
    const sortedAppointments = getSortedAppointments();
    const pendingAppointments = sortedAppointments.filter(app => app.doctorStatus === 'pending');

    const indexOfLastAppointment = currentPage * itemsPerPage;
    const indexOfFirstAppointment = indexOfLastAppointment - itemsPerPage;
    const currentAppointments = pendingAppointments.slice(indexOfFirstAppointment, indexOfLastAppointment);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mx-auto p-4">
            {pendingAppointments.length > itemsPerPage && (
                <div className="flex justify-end mb-4 space-x-2">
                    <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-l hover:bg-gray-400 disabled:opacity-50"
                    >
                        <FaLessThan />
                    </button>
                    <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === Math.ceil(pendingAppointments.length / itemsPerPage)}
                        className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-r hover:bg-gray-400 disabled:opacity-50"
                    >
                        <FaGreaterThan />
                    </button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-4 text-gray-500 text-xl">Loading...</div>
            ) : (
                <div className="grid grid-cols-1 md:gap-5 gap-1">
                    {currentAppointments.length > 0 ? (
                        currentAppointments.map((appointment) => {
                            const startTime = new Date(`1970-01-01T${appointment.time}:00`);
                            const interval = parseInt(appointment.interval, 10) || 0;
                            const endTime = addMinutes(startTime, interval);
                            return (
                                <div key={appointment.patientName} className="max-w-sm rounded overflow-hidden shadow-lg border bg-white p-4">
                                    <div className="flex items-center mb-4">
                                        {appointment.imageUrl && (
                                            <img
                                                src={appointment.imageUrl}
                                                alt={`Patient ${appointment.patientName}`}
                                                className="w-10 h-10 object-cover rounded-full mr-4"
                                            />
                                        )}
                                        <div>
                                            <div className="font-bold text-xl">{appointment.patientName}</div>
                                            <p className="text-gray-600">{format(startTime, ' h:mm a')} - {format(endTime, 'h:mm a')}</p>
                                            <p className="text-gray-600">{format(new Date(appointment.date), 'PPP')}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end mt-4 space-x-4">
                                        <button
                                            onClick={() => handleApproval('rejected', appointment.date, appointment.time)}
                                            className="bg-red-100 text-red-500 font-bold py-2 px-4 rounded hover:bg-red-200"
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => handleApproval('accepted', appointment.date, appointment.time)}
                                            className="bg-sky-100 text-sky-500 font-bold py-2 px-4 rounded hover:bg-sky-200"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-4 text-gray-500 text-xl">No pending appointments found</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ARAppointment;
