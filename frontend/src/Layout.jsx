import React from "react";
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from "./components/Sidebar/Sidebar";
import Header from "./components/Header/Header"; // Assuming you have a Header component
import Footer from "./components/Footer/Footer"; // Assuming you have a Footer component
import './Layout.css'; // Import the CSS file

const Layout = () => {
  const location = useLocation();
  const noHeaderFooterRoutes = ['/', /^\/resetpassword\/[^/]+$/,'/home'];
  const shouldShowHeaderFooter = !noHeaderFooterRoutes.some((route) => {
    return typeof route === 'string' 
      ? route === location.pathname 
      : route.test(location.pathname);
  });

  return (
    <div className={`layout ${shouldShowHeaderFooter ? '' : 'no-header-footer'}`}>
      {shouldShowHeaderFooter && <Sidebar />}
      <div className="main-content">
        {shouldShowHeaderFooter && <Header />}
        <div className="outlet">
          <Outlet/>
         
        </div>
        {shouldShowHeaderFooter && <Footer />}
      </div>
    </div>
  );
}

export default Layout;


