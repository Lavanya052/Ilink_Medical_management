import "./About.css";
import { useSelector } from "react-redux";
import { ToastContainer, toast } from 'react-toastify';
const About =() =>{

    // const userSelector =useSelector((state)=>state.user)
    // console.log(userSelector.username)
    // console.log(userSelector.person)
    return(
        <>
        <div className="about-container">
            <h2>About</h2>
            <p>This is a patient registration system</p>
        </div>
        <ToastContainer/>
        </>
    );
}


export default About;