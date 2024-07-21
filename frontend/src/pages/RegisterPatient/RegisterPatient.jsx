import "./RegisterPatient.css";
import CustomForm from "../../components/CustomForm/CustomForm";
import { useState } from "react";
import Button from "../../components/Button/Button";
import { useDispatch, useSelector } from "react-redux";
import { makePOSTreqForm } from "../../utils/api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

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

  return (
    <div className=" flex m-4">
      <div className="md:w-1/3 hidden lg:flex  flex flex-col items-center justify-center ">
        <img src="register.jpg" alt="register" className="w-full h-full" />
      </div>
    <div className="lg:w-2/3 w-full bg-white shadow-md rounded-xl p-2 max-w-4xl mt-4 ">
        <h2 className="text-3xl font-bold mb-4 text-center text-blue-500 mt-2">Register Patient</h2>
        <form onSubmit={registerPatient} className="grid grid-cols-2">
        <div className="ml-5 mr-5" >
            <label className="block mb-2 font-medium">Patient Image:</label>
            <CustomForm.Image onChange={handleImageChange} />
          </div>
          <div className="flex items-center justify-center h-10 mt-14">
            {imageUrl && (
              <img
                src={imageUrl}
                alt="Patient Preview"
                className="w-24 h-24 mb-7 border border-gray-400 rounded-xl"
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
          <div className="col-span-2 flex justify-end mr-4">
            <Button value={"Register"} type="submit" />
          </div>
        </form>
        <ToastContainer />
      </div>
    </div>
  );
};

export default RegisterPatient;
