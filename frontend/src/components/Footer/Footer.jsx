import React from "react";
import "./Footer.css";
import { FaEnvelope, FaPhone } from 'react-icons/fa';

const Footer = () => {
    return (
        <>
            <footer className="footer">
                {/* <div className="footer-content">
                <div className="section">
                    <img src="/logo.png" alt="logo" /></div>
                    <div className="section">
                        <h4>SUPPORT TEAM:</h4>
                        <p><FaEnvelope /> support@healify.com</p>
                        <p><FaPhone /> +91 0987654321</p>
                        <div className="social-media">
                            <a href="https://www.facebook.com"><img src="facebook.png" alt="Facebook" style={{ marginRight: '5px' }} /></a>
                            <a href="https://www.twitter.com"><img src="twitter.png" alt="Twitter" style={{ marginRight: '5px' }} /></a>
                            <a href="https://www.linkedin.com"><img src="linkedin.png" alt="Linkedin" style={{ marginRight: '5px' }} /></a>
                            <a href="https://www.instagram.com"><img src="insta.png" alt="Instagram" style={{ marginRight: '5px' }} /></a>
                        </div>
                    </div>
                    <div className="section">
                        <h4>QUICK LINKS</h4>
                        <a href="/home">Home</a><br />
                        <a href="/about-us">About Us</a>
                    </div>
                    <div className="section">
                        <h4>PRODUCTS</h4>
                        <div className="products-grid">
                            <a href="/op-billing"> OP Billing| </a>
                            <a href="/pharmacy"> Pharmacy| </a>
                            <a href="/stock"> Stock/Inventory|</a>
                            <a href="/in-patient"> In Patient| </a>
                            <a href="/meet-my-doctor"> Meet My Doctor</a>
                        </div>
                    </div>
                    
                </div> */}
                <div> &copy; {new Date().getFullYear()} Healthcare - All Rights Reserved | <a href="/privacy-policy">Privacy Policy</a></div>
            </footer>

        </>
    );
};

export default Footer;
