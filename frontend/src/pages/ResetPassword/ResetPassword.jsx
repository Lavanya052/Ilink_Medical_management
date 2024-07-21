import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomForm from "../../components/CustomForm/CustomForm";
import Button from "../../components/Button/Button";
import { makePOSTrequest } from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ResetPassword.css";

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");
    const { token } = useParams();
    const navigate = useNavigate();

    const submitPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            toast.error("New Password and Confirm Password do not match");
            return;
        }

        try {
            const res = await makePOSTrequest(`http://localhost:5000/users/resetpassword/${token}`, {
                password: newPassword,
                userType: localStorage.getItem("userType")
            });
            if (res.status === 200) {
                toast.success("Password reset successfully");
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            } else {
                toast.error(res.message || "Failed to reset password");
            }
        } catch (error) {
            console.error("Error during password reset:", error);
            toast.error("Error occurred while resetting password");
        }
    };

    return (
        <>
            <div id="reset-page">
                <div className="left">
                    <img src="/banner.png" alt="banner" />
                </div>
                <div className="right">
                    <h1 className="text-3xl mb-7 font-bold">Reset Password</h1>
                    <CustomForm>
                        <div className="ml-6 mr-6 md:mr-10 md:ml-10">
                            <CustomForm.Password
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="New Password" 
                            />
                        </div>
                        <div className="ml-6 mr-6 md:mr-10 md:ml-10">
                            <CustomForm.Password
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password" 
                            />
                        </div>
                        <br />
                        <Button value={"Submit"} onClick={submitPassword} className="resetButton">
                            Submit
                        </Button>
                    </CustomForm>
                    {message && <div className="message">{message}</div>}
                </div>
                <ToastContainer />
            </div>
           
        </>
    );
}

export default ResetPassword;
