import axios from "axios";

//check admin 
export const makeGETrequest = async (url, token = "") => {
    try {
        const response =await fetch(url,{
            method:"GET",
            headers:{
                Authorization:`Bearer ${token}`,
                "Content-Type":"application/json",
            },
        });
        // console.log(token)
        const responseData = await response.json();
        return responseData;

    } catch (error) {
        console.error("Error fetching data:", error);
        return error
    }
}

//signin
export const makePOSTrequest = async (url, data, token = "") => {

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        
        const responseData = await response.json();
        return responseData;
    }
    catch (error) {
        console.error("Error posting data:", data);
        return error;
    }
}

//registerform
export const makePOSTreqForm = async(url,formData,token="")=>{
    //  console.log("from api")
    try{
        
        const {data} =await axios.post(url,formData,{
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        })
    //    console.log(data,"from api");
        return data;
    }catch(error){
        console.log("Error Posting data:",error);
        return error.response.data;

    }
}