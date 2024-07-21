import './index.css'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import Layout from "./Layout"
import Profile from './components/Profile/Profile'
import About from './pages/About/About'
import AdminPanel from './pages/AdminPanel/AdminPanel'
import DoctorPanel from './pages/DoctorPanel/DoctorPanel'
import RegisterDoctor from './pages/RegisterDoctor/RegisterDoctor'
import RegisterPatient from './pages/RegisterPatient/RegisterPatient'
import SearchDoctor from './pages/SearchDoctor/SearchDoctor'
import SearchPatient from './pages/SearchPatient/SearchPatient'
import Signin from './pages/Signin/Signin'
import Error from "./components/Error/Error"
import Register from './pages/Register/Register'
import Search from './pages/Search/Search';
import SearchResult from './pages/SearchResult/SearchResult';
import AppointmentBooking from "./pages/AppointmentBooking/AppointmentBooking"
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import {Provider} from "react-redux";
import { store } from './redux/store'
import ResetPassword from './pages/ResetPassword/ResetPassword'
import AddAvailability from './pages/AddAvailability/AddAvailability'
import DoctorAvailability from './pages/DoctorAvailability/DoctorAvailability'


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
        path: "/register",
        element: <Register />
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
        path: "/search",
        element: <Search />
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
