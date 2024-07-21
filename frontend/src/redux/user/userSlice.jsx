import {createSlice} from "@reduxjs/toolkit";

export const userSlice = createSlice({
    name:"user",
    initialState:{
        tokenexpiration:"",
        id:"",
        phone:"",
        email:"",
        username:"",
        doctor:false,
        admin:false,
        person:"",
        selectedDoctorId: null, 
        firstname:"",
        lastname:"",
    },

    reducers:{
        login:(state,action)=>{
            // console.log("from userslice",action.payload);
            const{
                id,
                phone,
                email,
                username,
                doctor,
                admin,
                tokenexpiration,
                person,
                firstname,
                lastname,
            }=action.payload

            state.id=id;
            state.phone=phone;
            state.email=email;
            state.username=username;
            state.doctor=doctor;
            state.admin=admin;
            state.tokenexpiration=tokenexpiration;
            state.person=person;
            state.firstname=firstname;
            state.lastname=lastname;
        },

        logout:(state)=>{
            state.id="";
            state.phone="";
            state.email="";
            state.username="";
            state.doctor=false;
            state.admin=false;
            state.tokenexpiration="";
            state.person="";
            state.lastname="";
            state.firstname="";
        },
        setSelectedDoctorId: (state, action) => {
            state.selectedDoctorId = action.payload;
          },
    }
})

export const {login,logout,setSelectedDoctorId }=userSlice.actions;
export default userSlice.reducer;