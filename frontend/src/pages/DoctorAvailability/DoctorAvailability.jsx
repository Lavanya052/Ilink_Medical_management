
import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-calendar/dist/Calendar.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import AvailabilityTimeLine from "../../components/AvailabilityTimeLine/AvailabilityTimeLine";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from "react-redux";
import { makePOSTrequest, makeGETrequest } from "../../utils/api";
import "./DoctorAvailability.css"
const Toolbar = ({ onView, onNavigate, label }) => (
    <div className="rbc-toolbar flex items-center justify-between p-4 bg-white ">
        <div className="flex-1">
            <span className="text-lg font-semibold">{label}</span>
        </div>
        <div className="flex space-x-2">
            <button onClick={() => onView('week')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Week
            </button>
            <button onClick={() => onView('day')}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                Day
            </button>
        </div>
    </div>
);
const localizer = momentLocalizer(moment);
const DoctorAvailability = () => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [events, setEvents] = useState([]);
    const [selecting, setSelecting] = useState(false);
    const [selection, setSelection] = useState({ start: null, end: null });
    const [selectionEvent, setSelectionEvent] = useState(null);
    const userSelector = useSelector((state) => state.user);
    const doctorId = userSelector.id;
    const handleDateChange = (newDate) => {
        setSelectedDate(newDate);
        setSelection({ start: null, end: null });
        setSelecting(false);
        setSelectionEvent(null);
    };
    const handleSelectSlot = ({ start, end }) => {
        setSelecting(true);
        setSelection({ start, end });
        setSelectionEvent({
            start,
            end,
        });
    };
    const fetchAvailability = async (doctorId, date) => {
        try {
            const res = await makeGETrequest(
                `http://localhost:5000/doctors/getavailability/${doctorId}`,
                localStorage.getItem("token")
            );
    
            // console.log("fetch availability",res);
    
            if (res.status === 200) {
                const weekStart = moment(date).startOf('week');
                const weekEnd = moment(date).endOf('week');
                const availabilityForWeek = res.availability.filter(
                    slot => moment(slot.date).isBetween(weekStart, weekEnd, 'day', '[]')
                );
    
                const events = [];
    
                for (let day = weekStart.clone(); day.isBefore(weekEnd); day.add(1, 'days')) {
                    const specificDate = day.startOf('day');
                    const availabilityForDate = availabilityForWeek.filter(
                        slot => moment(slot.date).isSame(specificDate, 'day')
                    );
    
                    const isFullyUnavailable = availabilityForDate.every(slot => slot.notAvailable === true);
                    const dateAvailability = availabilityForDate.find(slot => moment(slot.date).isSame(specificDate, 'day'));
    
                    if (!dateAvailability) {
                        events.push({
                            id: `no-slot-${specificDate.format('YYYY-MM-DD')}`,
                            start: specificDate.set({ hour: 8, minute: 0 }).toDate(),
                            end: specificDate.set({ hour: 22, minute: 0 }).toDate(),
                            title: 'No slots specified',
                        });
                        continue;
                    }
    
                    if (isFullyUnavailable) {
                        events.push({
                            id: `not-available-${specificDate.format('YYYY-MM-DD')}`,
                            start: specificDate.set({ hour: 8, minute: 0 }).toDate(),
                            end: specificDate.set({ hour: 22, minute: 0 }).toDate(),
                            title: 'Not Available',
                        });
                    } else {
                        availabilityForDate.forEach(slot => {
                            const startTime = slot.startTime.trim();
                            const endTime = slot.endTime.trim();
    
                            const start = startTime !== '' ? specificDate.set({ hour: moment(startTime, 'HH:mm').hour(), minute: moment(startTime, 'HH:mm').minute() }).toDate() : null;
                            const end = endTime !== '' ? specificDate.set({ hour: moment(endTime, 'HH:mm').hour(), minute: moment(endTime, 'HH:mm').minute() }).toDate() : null;
    
                            if (start && end) {
                                events.push({
                                    id: `${specificDate.format('YYYY-MM-DD')}-${startTime}-${endTime}`,
                                    start,
                                    end,
                                    title: 'Available'
                                });
                            }
                        });
                    }
                }
    
                setEvents(events);
            } else {
                toast.error("No doctor availability data available");
               
            }
        } catch (error) {
            // console.error(error);
            toast.error('Failed to fetch availability');
        }
    };
    
    useEffect(() => {
        fetchAvailability(doctorId, selectedDate); // Fetch availability data on component mount or when doctorId/selectedDate changes
    }, [doctorId, selectedDate]);
    const handleSubmit = async (availabilityData) => {
        try {
            const res = await makePOSTrequest(
                "http://localhost:5000/doctors/addavailability",
                { doctorId, date:selectedDate,availability: [availabilityData] },
                localStorage.getItem("token")
            );
            if (res.status === 200) {
                toast.success(res.message || 'Availability submitted successfully!');
                fetchAvailability(doctorId, selectedDate);
            } else if (res.status === 409) {
                const confirmed = window.confirm(res.message + " Overwrite?");
                if (confirmed) {
                    const overwriteRes = await makePOSTrequest(
                        "http://localhost:5000/doctors/addavailability",
                        { doctorId,date:selectedDate, availability: [availabilityData], overwrite: true },
                        localStorage.getItem("token")
                    );
                    if (overwriteRes.status === 200) {
                        toast.success('Availability updated successfully!');
                        fetchAvailability(doctorId, selectedDate);
                    } else {
                        toast.error(overwriteRes.message || 'Failed to update availability');
                    }
                }
            } else {
                toast.error(res.message || 'Failed to submit availability');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to submit availability');
        }
    };
    const handleCancel = () => {
        setSelecting(false);
        setSelection({ start: null, end: null });
        setSelectionEvent(null);
    };
    return (<>
     <h1 className="text-3xl font-bold text-blue-600 ml-8 mt-4 ">Set Availability</h1>
        <div className="flex min-h-screen p-4">
            <div className="flex-none w-1/3 p-4">
                <h2 className="text-blue-600 text-bold text-2xl mb-4 font-semibold">Select Date</h2>
                <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    className="custom-calendar"
                />
                <br />
                <AvailabilityTimeLine
                    selectedDate={selectedDate}
                    selectedStartTime={selection.start ? moment(selection.start).format('hh:mm A') : ''}
                    selectedEndTime={selection.end ? moment(selection.end).format('hh:mm A') : ''}
                    onSubmit={handleSubmit}
                />
            </div>
            <div className="flex-2 w-2/3 p-4">
                <h2 className="text-blue-600 text-bold text-2xl mb-4 font-semibold justify-left">TimeLine</h2>
                <BigCalendar
                    localizer={localizer}
                    events={[...events, selectionEvent]}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 'calc(100vh - 2rem)' }} // Adjust height to fit within padding
                    views={['week', 'day']}
                    defaultView="day"
                    min={new Date(selectedDate.setHours(8, 0, 0, 0))}
                    max={new Date(selectedDate.setHours(23, 0, 0, 0))}
                    step={60}
                    timeslots={1}
                    showMultiDayTimes
                    selectable
                    onSelectSlot={handleSelectSlot}
                    eventPropGetter={(event) => ({
                        style: {
                            backgroundColor:  event === selectionEvent ? 'rgba(128, 128, 128, 0.3)' :
                            event.title === 'Not Available' ? 'rgba(255, 0, 0, 0.3)' :
                            event.title === 'No slots specified' ? 'rgba(0, 0, 255, 0.3)' :
                            'rgba(0, 255, 0, 0.3)',
                            borderRadius: '0px',
                            opacity: 0.8,
                            color: 'black',
                        },
                    })}
                    className='bg-white rounded-lg p-4 min-h-screen'
                    date={selectedDate}
                    components={{
                        toolbar: (props) => (
                            <Toolbar
                                onView={props.onView}
                                onNavigate={props.onNavigate}
                                label={props.label}
                            />
                        )
                    }}
                />
            </div>
            <ToastContainer />
        </div>
        </>
    );
};
export default DoctorAvailability;
