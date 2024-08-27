import "./Signin.css";
import CustomForm from "../../components/CustomForm/CustomForm";
import React, { useState, useEffect } from "react";
import { Radio, Drawer } from "antd";
import Icon from "../../components/Icon/Icon";
import Button from "../../components/Button/Button";
import { makePOSTrequest } from "../../utils/api";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../redux/user/userSlice";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Signin = () => {
  const [identifier, setIdentifier] = useState("");
  const [forgetEmail, setForgetEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [accountType, setAccountType] = useState(""); // Ensure this is used correctly in the component
  const [welcomeMessage, setWelcomeMessage] = useState(""); // State for welcome message
  const dispatch = useDispatch();
  const userSelector = useSelector((state) => state.user); // Ensure this selector is correct
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (message) {
      setIdentifier("");
      setPassword("");
    }
  }, [message]);

  const handleAccountTypeClick = (type) => {
    setAccountType(type.toLowerCase());
    setWelcomeMessage(`Hello ${type.charAt(0).toUpperCase() + type.slice(1)}!<br/>
                Please fill out the form below to get started`);
  };

  const submitData = async (e) => {
    e.preventDefault();
    try {
      if (!accountType) {
        toast.error("Please select User");
      } else {
        const res = await makePOSTrequest("http://localhost:5000/users/signin", {
          identifier,
          password,
        });

        if (res.status === 200) {
          localStorage.setItem("token", res.token);
          localStorage.setItem("person", res.person);
          dispatch(login({ username: res.username, person: res.person, id:res.id }));

          if (res.person === "doctors" && accountType === "doctor") {
            navigate("/doctorpanel");
          } else if (res.person === "admin" && accountType === "admin") {
            navigate("/adminpanel");
          } else {
            toast.error("Invalid User Type Selected!");
          }
        } else {
          toast.error(res.message);
        }
      }
    } catch (error) {
      console.error("Error during submission:", error);
      setMessage("Error occurred while logging in");
    }
  };

  const HandleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const res = await makePOSTrequest("http://localhost:5000/users/forgotpassword", {
        email: forgetEmail,
      });
      // console.log("return from api",res)
      if (res.status === 200) {
        localStorage.setItem("userType", res.person);
        toast.success("Check your Email");
        navigate("/");
      } else {
        toast.error("Invalid Email");
        navigate("/");
      }
    } catch (error) {
      console.error("Error during send mail:", error);
      setMessage("Error occurred while send mail");
    }
  };

  return (
    <div id="signin-page">
      <div className="leftside">
        <img src="./banner.png" alt="banner" />
      </div>
      <div className="rightside">
        <div className="account-type">
          <h1 className="text-3xl mb-7 font-bold">Login</h1>
          <div>
            <Radio.Group
              value={accountType}
              onChange={(e) => handleAccountTypeClick(e.target.value)}
              className={"radiogroup"}
            >
              <Radio.Button
                value="patient"
                className={`radiobutton ${accountType === "patient" ? "selected" : ""}`}
              >
                Patient
              </Radio.Button>
              <Radio.Button
                value="doctor"
                className={`radiobutton ${accountType === "doctor" ? "selected" : ""}`}
              >
                Doctor
              </Radio.Button>
              <Radio.Button
                value="admin"
                className={`radiobutton ${accountType === "admin" ? "selected" : ""}`}
              >
                Admin
              </Radio.Button>
            </Radio.Group>
          </div>
          {accountType && (
            <div className="Profileimg">
              <img src={`/${accountType}.png`} alt="profile" />
            </div>
          )}
          {welcomeMessage && (
            <div className="welcome-message" dangerouslySetInnerHTML={{ __html: welcomeMessage }}></div>
          )}
        </div>
        <CustomForm>
          <div className="ml-6 mr-6 md:mr-10 md:ml-10">
            <CustomForm.Input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                accountType === "patient" ? "Email or Phone Number" : "Email or ID"
              }
            />
          </div>
          <div className="ml-6 mr-6 md:mr-10 md:ml-10">
            <CustomForm.Password
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
            />
          </div>
          <br />
          <div className="signin-actions">
            <Button value={"Login"} onClick={submitData} className="button">
              Login
            </Button>
            <p className="forget-password">
              <span style={{ color: "blue", cursor: "pointer" }} onClick={showDrawer}>
                Forget Password?
              </span>
            </p>
          </div>
        </CustomForm>
        {message && <div className="message">{message}</div>}

        <Drawer
          title="Forget Password"
          placement="left"
          onClose={onClose}
          open={open}
          styles={{
            wrapper: {
              width: "400px", // Adjust the width as needed
              margin: "auto",
              top: "45%",
              left: "40%",
              transform: "translateY(-50%)",
              height: "300px",
            },
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "18px" }}>Enter Email</label>
            <input
              type="email"
              placeholder="example@mail.com"
              name="email"
              onChange={(e) => setForgetEmail(e.target.value)}
              required
              style={{
                width: "100%",
                height: "3rem",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#ccc",
                fontSize: "18px",
                marginTop: "10px",
                paddingLeft: "10px",
              }}
            />
          </div>

          <button
            style={{
              width: "50%",
              margin: " 20px auto",
              display: "flex",
              padding: "10px",
              fontSize: "18px",
              backgroundColor: "rgba(28, 100, 243, 0.919)",
              border: "none",
              borderRadius: "10px",
              cursor: "pointer",
              justifyContent: "center",
              color: "white",
            }}
            onClick={HandleChangePassword}
          >
            Send mail
          </button>
        </Drawer>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Signin;
