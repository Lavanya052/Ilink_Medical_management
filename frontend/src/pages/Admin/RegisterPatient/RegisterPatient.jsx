import CustomForm from "../../../components/CustomForm/CustomForm";
import { useState } from "react";
import Button from "../../../components/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { makePOSTreqForm } from "../../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate,Link} from "react-router-dom";


const RegisterPatient = () => {
  const [id, setId] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [gender, setGender] = useState("");
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userSelector = useSelector((state) => state.user);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const imageUrl = URL.createObjectURL(file);
      setImageUrl(imageUrl);
    }
  };

  const registerPatient = async (e) => {
    e.preventDefault();

    if (!image) {
      toast.error("Please select a patient image.");
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
        firstName,
        lastName,
        address,
        // city,
        // state,
        // zipCode,
        gender,
        birthday,
      })
    );
    try {
      const res = await makePOSTreqForm(
        "http://localhost:5000/patients/registerpatient",
        formData,
        localStorage.getItem("token")
      );

      if (res.status === 201) {
        toast.success(res.message);
        setTimeout(() => {
          userSelector.admin ? navigate("/adminpanel") : navigate("/home");
        }, 2000);
      } else {
        toast.error(res.message);
        setTimeout(() => {
          navigate("/registerPatient");
        }, 1000);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("An error occurred. Please try again.");
    }
  };
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
            <Link to="/registerPatient" className="text-blue-600 hover:text-blue-800">
              Register
            </Link>
          </li>
        </ol>
        <div className="ml-auto">
          <select
            onChange={handleNavigationChange}
            className="w-full p-2 border rounded-lg"
          >
            <option value="patient">Patient Registration</option>
            <option value="doctor">Doctor Registration</option>
            <option value="admin">Admin Registration</option>
          </select>
        </div>
      </nav>

      <div className=" flex m-4">
        <div className="md:w-1/3 hidden lg:flex  flex flex-col items-center justify-center ">
          <img src="register.jpg" alt="register" className="w-full h-full" />
        </div>
        <div className="lg:w-2/3 w-full bg-white shadow-md rounded-xl p-1 max-w-4xl mt-1 ">
          <h2 className="text-3xl font-bold mb-4 text-center text-blue-500 mt-2">Register Patient</h2>
          <form onSubmit={registerPatient} className="grid grid-cols-2">
            <div className="ml-5 mr-5" >
              <CustomForm.Image onChange={handleImageChange} />
            </div>
            <div className="flex items-center justify-center h-10 mt-5">
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Patient Preview"
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
                placeholder="Patient Id"
              />
            </div>
            <div className="ml-5 mr-5">
              <CustomForm.Email
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Patient Email"
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
              <CustomForm.Birthday
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
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
              <CustomForm.Address
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Address"
              />
            </div>
            <div className="col-span-2 flex justify-end mr-4 mt-2">
              <Button value={"Register"} type="submit" />
            </div>
          </form>
          <ToastContainer />
        </div>
      </div>
    </>
  );
};

export default RegisterPatient;
