require("dotenv").config()

const express = require("express");
const cors = require("cors");

const app=express();

const patientsRouter = require("./routes/patients");
const doctorsRouter =require("./routes/doctors");
const usersRouter =require("./routes/users");
const returnStatus =require("./helpers/returnStatus");
const appointmentRouter =require("./routes/appointments")


app.use(express.json());
app.use(cors());
app.use("/users",usersRouter);
app.use("/patients",patientsRouter);
app.use("/doctors",doctorsRouter);
app.use("/appointments",appointmentRouter)

//landing page
app.get("/",(req,res)=>{
    res.send("Hello,World!");
});

//when req happen middleware work
//run if url not found
app.use((req,res,next)=>{
    console.log("in error page");
    return returnStatus(res,404,true,"Not found",{ additional: 'info' });
})

//port to run server
const port =process.env.PORT; // prevent to know the port by other
app.listen(port,()=>{
    console.log(`Server is running in a Port ${port}`);
})