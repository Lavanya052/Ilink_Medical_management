import "./CustomForm.css";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaUserCircle, FaMapMarkerAlt, FaPhone, FaSearch, FaTimes, FaUnlockAlt, FaBirthdayCake } from 'react-icons/fa';
import { useState } from "react";
import {
    Grid,
    TextField,
    Paper,
    Typography,
    InputAdornment,
    MenuItem,
} from "@mui/material";
export default function CustomForm(props) {
    return <form action="">{props.children}</form>;
}
// IdField component
CustomForm.Id = function IdField(props) {
    return (
        <div className="input-group ">
            <div className="input-group-text">
                {/* <FaUser className="icon" /> */}
                <TextField
                    type="text"
                    name="id"
                    label={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

// EmailField component
CustomForm.Email = function EmailField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                <FaEnvelope className="icon" />
                <TextField
                    label={props.placeholder}
                    value={props.value}
                    className="form-control"
                    required={true}
                    onChange={props.onChange}
                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

CustomForm.Password = function PasswordField(props) {
    const [showPassword, setShowPassword] = useState(false);
    const [type, setType] = useState("password");

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
        if (type === "password") { setType("text") }
        else { setType("password") }
    };

    return (
        <div className="input-group ">
            <div className="input-group-text">

                <TextField
                    type={type}
                    label={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    className="form-control"
                    required={true}
                    fullWidth
                    margin="normal"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                {showPassword ? (
                                    <FaEye className="icon" onClick={togglePasswordVisibility} />
                                ) : (
                                    <FaEyeSlash className="icon" onClick={togglePasswordVisibility} />
                                )}
                            </InputAdornment>
                        ),
                    }}
                />
            </div>
        </div>
    );
};
// UsernameField component
CustomForm.Username = function UsernameField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                <FaUserCircle className="icon" />

                <TextField
                    type="text"
                    name="username"
                    label="Username"
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

// AddressField component
CustomForm.Address = function AddressField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                <FaMapMarkerAlt className="icon" />

                <TextField
                    type="text"
                    name="address"
                    label="Address"
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                    
                />
            </div>
        </div>
    );
};

// PhoneField component
CustomForm.Phone = function PhoneField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                <FaPhone className="icon" />

                <TextField
                    type="text"
                    name="phone"
                    label={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}

                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

// MedicalRecordField component
CustomForm.MedicalRecord = function MedicalRecordField(props) {
    return (
        <TextField
            type="text"
            name="medicalrecord"
            label="Medical Record"
            value={props.value}
            onChange={props.onChange}
            required={true}
            fullWidth
            margin="normal"
            multiline
            rows={10}
        />
    );
};

// ImageField component
CustomForm.Image = function ImageField(props) {
    return (
       
        <div className="input-group ">
        <div className="input-group-text">
            {/* <FaUser className="icon" /> */}
            <TextField
            type="file"
            onChange={props.onChange}
            required={true}
            fullWidth
            margin="normal"
        />
        </div>
    </div>
    );
};

// Generic InputField component


CustomForm.Search = function SearchField(props) {
    const { placeholder, value, onChange, onKeyPress, onSearch, className } = props;

    return (
        <div className="search-field-container">
            <div className="input-container">
                <input
                    type="text"
                    name="search"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    onKeyPress={onKeyPress}
                    className={`search-input ${className}`}
                />
                {value ? (
                    <FaTimes className="clear-icon" onClick={() => onChange({ target: { value: "" } })} />
                ) : (
                    <FaSearch className="search-icon" onClick={onSearch} />
                )}
            </div>
        </div>
    );
};


// FirstNameField component
CustomForm.FirstName = function FirstNameField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                {/* <FaUser className="icon" /> */}

                <TextField
                    type="text"
                    name="firstName"
                    label="First Name"
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

// LastNameField component
CustomForm.LastName = function LastNameField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                {/* <FaUser className="icon" /> */}
                <TextField
                    type="text"
                    name="lastName"
                    label="Last Name"
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

// AddressLine2Field component
CustomForm.AddressLine2 = function AddressLine2Field(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                {/* <FaMapMarkerAlt className="icon" /> */}

                <TextField
                    type="text"
                    name="addressLine2"
                    label={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

// CityField component
CustomForm.City = function CityField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                {/* <FaMapMarkerAlt className="icon" /> */}

                <TextField
                    type="text"
                    name="city"
                    label="City"
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

// StateField component
CustomForm.State = function StateField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                {/* <FaMapMarkerAlt className="icon" /> */}

                <TextField
                    type="text"
                    name="state"
                    label="State"
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

// ZipCodeField component
CustomForm.ZipCode = function ZipCodeField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                {/* <FaMapMarkerAlt className="icon" /> */}

                <TextField
                    type="text"
                    name="zipCode"
                    label="Zip Code"
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

// HomePhoneField component
CustomForm.HomePhone = function HomePhoneField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
                <FaPhone className="icon" />

                <TextField
                    type="text"
                    name="homePhone"
                    label={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    fullWidth
                    margin="normal"
                />
            </div>
        </div>
    );
};

// BirthdayField component
CustomForm.Birthday = function BirthdayField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">

                <TextField
                    type="date"
                    name="birthday"
                    label="Birthday"
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ className: "date-input" }}
                />
            </div>
        </div>
    );
};

// Generic InputField component
CustomForm.Input = function InputField(props) {
    return (

        <div className="input-group">
            <div className="input-group-text">

                <TextField
                    type="text"
                    name="input"
                    label={props.placeholder}
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                />

            </div>
        </div>
    );
};

// GenderField component
CustomForm.Gender = function GenderField(props) {
    const genderOptions = [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "others", label: "Others" },
    ];

    return (
        <div className="input-group">
            <div className="input-group-text">
                {/* <FaUser className="icon" /> */}

                <TextField
                    select
                    name="gender"
                    label="Gender"
                    value={props.value}
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                >
                    {genderOptions.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </div>
        </div>
    );
};
// SpecialtyField component
CustomForm.Options = function SpecialtyField(props) {
    return (
        <div className="input-group">
            <div className="input-group-text">
               

                <TextField
                    select
                    name="Options"
                    label={props.placeholder}
                    value={props.value} 
                    onChange={props.onChange}
                    required={true}
                    fullWidth
                    margin="normal"
                >
                    {props.Options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                            {option.label}
                        </MenuItem>
                    ))}
                </TextField>
            </div>
        </div>
    );
};
