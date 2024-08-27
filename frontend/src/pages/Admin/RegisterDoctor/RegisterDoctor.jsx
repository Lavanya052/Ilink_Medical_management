  import CustomForm from "../../../components/CustomForm/CustomForm";
  import { useState } from "react";
  import Button from "../../../components/Button/Button";
  import { makePOSTreqForm } from "../../../utils/api";
  import { ToastContainer, toast } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";
  import { useNavigate,Link } from "react-router-dom";
  import { useSelector } from "react-redux";

  const RegisterDoctor = () => {
    const [id, setId] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [emergencyPhone, setEmergencyPhone] = useState("")
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [state, setState] = useState("");
    const [zipCode, setZipCode] = useState("");
    const [birthday, setBirthday] = useState("");
    const [homePhone, setHomePhone] = useState("");
    const [image, setImage] = useState(null);
    const [imageUrl, setImageUrl] = useState("");
    const [speciality, setSpeciality] = useState("");
    const [gender, setGender] = useState("");
    const [message, setMessage] = useState("");
    const [step, setStep] = useState(1);
    const navigate = useNavigate();
    const userSelector = useSelector((state) => state.user);


    const specialtyOptions = [
      { value: "cardiology", label: "Cardiology" },
      { value: "neurology", label: "Neurology" },
      { value: "dermatology", label: "Dermatology" },
      { value: "orthopedics", label: "Orthopedics" },
    ];

    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setImage(file);
        const imageUrl = URL.createObjectURL(file);
        setImageUrl(imageUrl);
      }
    };

    const submitDoctor = async (e) => {
      e.preventDefault();
      if (!image) {
        toast.error("Please select a doctor image.");
        return;
      }
      const formData = new FormData();
      formData.append("file", image);
      formData.append(
        "data",
        JSON.stringify({
          id,
          email,
          phone,
          password,
          username,
          firstName,
          lastName,
          address,
          emergencyPhone,
          // city,
          // state,
          // zipCode,
          gender,
          speciality,
        })
      );
      const res = await makePOSTreqForm(
        "http://localhost:5000/doctors/registerdoctor",
        formData,
        localStorage.getItem("token")
      );
      setMessage(res.message);
      if (res.status === 201) {
        toast.success(res.message);
        setTimeout(() => {
          navigate("/adminpanel");
        }, 2000);
      } else {
        toast.error(res.message);
        setTimeout(() => {
          navigate("/registerDoctor");
        }, 1000);
      }
    };

    const renderStepOne = () => (
      <>
        <div className="ml-5 mr-5">
          <CustomForm.Image onChange={handleImageChange} />
        </div>
        <div className="flex items-center justify-center h-10 mt-5">
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Doctor Preview"
            className="w-20 h-20  border border-gray-400 rounded-xl"
            />
          )}
        </div>
        <div className="ml-5 mr-5">
          <CustomForm.FirstName
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First Name"
          />
        </div>
        <div className="ml-5 mr-5">
          <CustomForm.LastName
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last Name"
          />
        </div>
        <div className="ml-5 mr-5">
          <CustomForm.Id
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Doctor Id"
          />
        </div>
        <div className="ml-5 mr-5">
          <CustomForm.Email
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Doctor Email"
          />
        </div>
        <div className="ml-5 mr-5">
          <CustomForm.Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </div>
        <div className="ml-5 mr-5">
          <CustomForm.Username
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
          />
        </div>

      </>
    );

    const renderStepTwo = () => (
      <>
        <div className="ml-5 mr-5">
          <CustomForm.Options
            value={speciality}
            onChange={(e) => setSpeciality(e.target.value)}
            placeholder="Speciality"
            Options={specialtyOptions}
          />
        </div>
        <div className="ml-5 mr-5">
          <CustomForm.Gender
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="Gender"
          />
        </div>
        <div className="ml-5 mr-5">
          <CustomForm.Phone
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Mobile No"
          />
        </div>
        <div className="ml-5 mr-5">
          <CustomForm.Phone
            value={emergencyPhone}
            onChange={(e) => setEmergencyPhone(e.target.value)}
            placeholder="Emergency mobile No"
          />
        </div>
        <div className="ml-5 mr-5">
          <CustomForm.Address
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address"
          />
          <br />
        </div>
      </>
    );

    const handleNavigationChange = (e) => {
      const selectedPage = e.target.value;
      if (selectedPage === "admin") navigate("/adminpanel");
      if (selectedPage === "patient") navigate("/registerPatient");
      if (selectedPage === "doctor") navigate("/registerDoctor");
    };

    return (
      <>
        <nav className="flex items-center justify-between py-3 px-5 bg-gray-100 rounded-md w-full">
          <ol className="list-reset flex text-grey-dark">
            <li className="flex text-lg items-center">
              {userSelector.admin && (
                <Link to="/adminpanel" className="text-blue-600 hover:text-blue-800">
                  Home
                </Link>
              )}
            </li>
            <li className="flex text-lg items-center mx-2 text-gray-500">
              &gt;
            </li>
            <li className="flex text-lg items-center">
              <Link to="/registerDoctor" className="text-blue-600 hover:text-blue-800">
                Register
              </Link>
            </li>
          </ol>
          <div className="ml-auto">
            <select
              onChange={handleNavigationChange}
              className="w-full p-2 border rounded-lg"
            >
              <option value="doctor">Doctor Registration</option>
              <option value="patient">Patient Registration</option>
              <option value="admin">Admin Registration</option>
            </select>
          </div>
        </nav>


        <div className="flex mt-1">
          <div className="md:w-1/3 hidden lg:flex flex-col items-center justify-center">
            <img src="register.jpg" alt="register" />
          </div>

          <div className="lg:w-2/3 h-[480px] bg-white shadow-md rounded-xl p-3 md:w-4xl  mt-5 lg:ml-5 lg:mr-5 m-auto flex flex-col">
            <h2 className="text-3xl font-bold mb-4 text-center text-blue-500 mt-2">Register Doctor</h2>
            <form onSubmit={submitDoctor} className="flex flex-col flex-grow">
              <div className="flex-grow">
                <div className="grid grid-cols-2">
                  {step === 1 && renderStepOne()}
                  {step === 2 && renderStepTwo()}
                </div>
              </div>
              <div className="flex justify-between items-end mt-4 ">
                {step > 1 && (
                  <div className="flex justify-start ml-5">
                    <Button value={"Previous"} type="button" onClick={() => setStep(step - 1)} />
                  </div>
                )}
                {step < 2 && (
                  <div className="flex justify-end ml-auto mr-5">
                    <Button value={"Next"} type="button" onClick={() => setStep(step + 1)} />
                  </div>
                )}

                {step === 2 && (
                  <div className="flex justify-end ml-auto mr-5">
                    <Button value={"Register"} type="submit" />
                  </div>
                )}
              </div>
            </form>
            <ToastContainer />
          </div>

        </div>
      </>
    );
  };

  export default RegisterDoctor;
