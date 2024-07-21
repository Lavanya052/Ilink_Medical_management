// // const {MongoClient}=require("mongodb");

// // const uri="mongodb://localhost:27017/";
// // const dbName="medicalPortal";
// // let db =null;
// // const client = new MongoClient(uri);


// // async function getDatabase(){

// //     try{
// //         await client.connect();
// //         db= client.db(dbName);
// //         return db;

// //     }
// //     catch(error){
// //         console.log(error);
// //         throw new Error(error);
// //     }
// // }


// // module.exports={getDatabase,client}

// const { MongoClient } = require("mongodb");

// const uri = "mongodb://localhost:27017/";
// const dbName = "medicalPortal";
// let client = null;
// let db = null;

// async function connectToDatabase() {
//     try {
//         client = new MongoClient(uri);  
//         await client.connect();
//         db = client.db(dbName);
//         // console.log("Connected to MongoDB!");
//     } catch (error) {
//         console.error("Error connecting to MongoDB:", error);
//         throw new Error("Could not connect to MongoDB");
//     }
// }

// async function getDatabase() {
//     if (!db) {
//         await connectToDatabase();
//     }
//     return db;
// }

// module.exports = { getDatabase, client };



















const {MongoClient}=require("mongodb");

const uri="mongodb://localhost:27017/";
const dbName="medicalPortal";
let db =null;
const client = new MongoClient(uri);


async function getDatabase(){

    try{
        await client.connect();
        db= client.db(dbName);
        return db;

    }
    catch(error){
        console.log(error);
        throw new Error(error);
    }
}


module.exports={getDatabase,client}