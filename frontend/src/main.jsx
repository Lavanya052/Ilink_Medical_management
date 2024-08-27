import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Layout from "./Layout"
import Profile from './components/Profile/Profile'
import About from './pages/About/About'
import AdminPanel from './pages/Admin/AdminPanel/AdminPanel'
import DoctorPanel from './pages/Doctor/DoctorPanel/DoctorPanel'
import RegisterDoctor from './pages/Admin/RegisterDoctor/RegisterDoctor'
import RegisterPatient from './pages/Admin/RegisterPatient/RegisterPatient'
import SearchDoctor from './pages/SearchDoctor/SearchDoctor'
import SearchPatient from './pages/SearchPatient/SearchPatient'
import Signin from './pages/Signin/Signin'
import Error from "./components/Error/Error"

import SearchResult from './pages/SearchResult/SearchResult';
import AppointmentBooking from "./pages/Admin/AppointmentBooking/AppointmentBooking.jsx"
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import {Provider} from "react-redux";
import { store } from './redux/store'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import AddAvailability from './pages/Admin/AddAvailability/AddAvailability'
import DoctorAvailability from './pages/Doctor/DoctorAvailability/DoctorAvailability'
import Appointments from './pages/Admin/Appointments/Appointments'
import DoctorAppointments from './pages/Doctor/DoctorAppointments/DoctorAppointments'
import MyPatients from './pages/Doctor/MyPatients/MyPatients'
import EditPatientD from './pages/EditPatientD/EditPatientD'
import EditDoctorD from './pages/EditDoctorD/EditDoctorD'
import AddMedicalR from './pages/Doctor/AddMedicalR/AddMedicalR'


const router =createBrowserRouter([
  {
    element:  <Layout />,
    errorElement:  <Error />,
    children:[
      {
        path : "/home",
        element : <App />
      },
      {
        path:"/about",
        element:  <About />
      },
      {
        path: "/searchPatient",
        element: <SearchPatient />
      },
      {
        path:"/",
        element: <Signin />
      },
      {
        path:"/registerPatient",
        element: <RegisterPatient />
      },
      {
        path: "/searchDoctor",
        element: <SearchDoctor />
      },
      {
        path: "/registerDoctor",
        element: <RegisterDoctor />
      },
      {
        path: "/adminpanel",
        element: <AdminPanel />
      },
      {
        path: "/profile",
        element: <Profile />
      },
      {
        path: "/search-result",
        element: <SearchResult />
      },
      {
        path: "/resetpassword/:token",
        element: <ResetPassword/>
      },
      {
        path: "/appointmentbooking",
        element: <AppointmentBooking/>
      },
      {
        path:"/addavailability",
        element:<AddAvailability/>
      },
      {
        path:"/doctorpanel",
        element:<DoctorPanel/>
      },
      {
        path:"/create-schedule",
        element:<DoctorAvailability/>
      },
      {
        path:"/appointments",
        element:<Appointments/>
      },
      {
        path:"/doctorappointments",
        element:<DoctorAppointments/>
      },
      {
        path:"/mypatients",
        element:<MyPatients/>
      },
      {
        path:"/editpatientdetails",
        element:<EditPatientD/>
      },
      {
        path:"/editdoctordetails",
        element:<EditDoctorD/>
      },
      {
        path:"/addmedicalrecord",
        element:<AddMedicalR/>
      }
    ],
  },
]);
ReactDOM.createRoot(document.getElementById('root')).render(
  // <React.StrictMode>
  <Provider store={store}>
      <RouterProvider router={router}/>
  </Provider>

  // </React.StrictMode>,
)
