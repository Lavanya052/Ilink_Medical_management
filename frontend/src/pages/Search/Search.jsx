import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button as MuiButton,
  TextField,
} from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import CustomForm from "../../components/CustomForm/CustomForm";
import { makeGETrequest, makePOSTrequest } from "../../utils/api";
import "./Search.css";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [patient, setPatient] = useState({});
  const [medicalRecord, setMedicalRecord] = useState("");
  const [showData, setShowData] = useState(false);
  const [updateEmail, setUpdateEmail] = useState("");
  const [updatePhone, setUpdatePhone] = useState("");
  const [showUpdate, setShowUpdate] = useState(false);
  const [resultsCount, setResultsCount] = useState(0); // State to store the number of results

  const userSelector = useSelector((state) => state.user);

  async function submitSearch(e) {
    e.preventDefault();

    const url = new URL("http://localhost:5000/patients/searchpatient");

    if (searchTerm.match(/^[\d{4}]+$/)) {
      url.searchParams.append("id", searchTerm);
    } else {
      url.searchParams.append("username", searchTerm);
    }
    const res = await makeGETrequest(url.toString());
    setMessage(res.message);

    if (res.patient) {
      const patientData = JSON.parse(res.patient);
      setPatient(patientData);
      setResultsCount(patientData.length); // Update results count
    } else {
      setPatient({});
      setResultsCount(0); // Reset results count if no patient found
    }
  }

  async function updateContact(e) {
    e.preventDefault();
    const res = await makePOSTrequest(
      "http://localhost:5000/patients/updatepatient",
      {
        id: patient.id,
        email: updateEmail,
        phone: updatePhone,
      },
      localStorage.getItem("token")
    );

    if (res.status === 201) {
      setShowUpdate(!showUpdate);
      setPatient(JSON.parse(res.patient));
    }

    setMessage(res.message);
  }

  async function submitMedicalRecord(e) {
    e.preventDefault();
    const res = await makePOSTrequest(
      "http://localhost:5000/patients/addmedicalrecord",
      {
        medicalRecord: medicalRecord,
        id: patient.id,
      },
      localStorage.getItem("token")
    );

    if (res.status === 201) {
      setMedicalRecord("");
      setShowData(!showData);
      setPatient(JSON.parse(res.patient));
    }

    setMessage(res.message);
  }

  const deleteRecord = (recordId) => {
    // Implement the delete functionality here
  };

  return (<>
    <div className="search-container">
      <h2>Search</h2>
      <CustomForm>
        <div className="search-input-container">
          <FontAwesomeIcon icon={faSearch} />
          <CustomForm.Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Patient/Doctor ID or Name"
          />
        </div>
        <MuiButton variant="contained" onClick={submitSearch}>
          Search
        </MuiButton>
      </CustomForm>
      {showUpdate && (
            <CustomForm>
              <TextField
                label="Email"
                value={updateEmail}
                onChange={(e) => setUpdateEmail(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
              />
              <TextField
                label="Phone"
                value={updatePhone}
                onChange={(e) => setUpdatePhone(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
              />
              <MuiButton variant="contained" onClick={updateContact}>
                Update
              </MuiButton>
            </CustomForm>
          )}

          {showData && (
            <CustomForm>
              <TextField
                label="Medical Record"
                value={medicalRecord}
                onChange={(e) => setMedicalRecord(e.target.value)}
                variant="outlined"
                fullWidth
                margin="normal"
              />
              <MuiButton variant="contained" onClick={submitMedicalRecord}>
                Update
              </MuiButton>
            </CustomForm>
          )}
    </div>
    {resultsCount > 0 && (
        <div style={{ marginTop: "10px" }}>
          <p>{resultsCount} result(s) found</p>
        </div>
      )}

    {patient.username && (
        <div style={{ marginTop: "30px" }}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Field</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell><b>Id</b></TableCell>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell rowSpan="5">
                    {userSelector.admin && (
                      <>
                        <IconButton onClick={() => setShowUpdate(!showUpdate)}>
                          <FontAwesomeIcon icon={faEdit} />
                        </IconButton>
                        <IconButton onClick={() => deleteRecord(patient.id)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><b>Doctor</b></TableCell>
                  <TableCell>{patient.username}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><b>Email</b></TableCell>
                  <TableCell>{patient.email}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><b>Phone No.</b></TableCell>
                  <TableCell>{patient.phone}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><b>Address</b></TableCell>
                  <TableCell>{patient.address}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><b>Medical Record</b></TableCell>
                  <TableCell colSpan="2">
                    <ul>
                      {patient.medicalRecord.map((item, index) => (
                        <li key={index}>
                          {item.date}: {item.record}
                        </li>
                      ))}
                    </ul>
                    {userSelector.doctor && (
                      <MuiButton
                        variant="contained"
                        onClick={() => setShowData(!showData)}
                      >
                        Add new Record
                      </MuiButton>
                    )}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </div>
      )}
      <br />
      {message}</>
  );
};

export default Search;
