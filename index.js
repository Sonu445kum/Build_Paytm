const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./DB/index");
connectDB();
app.get("/",(req,res)=>{
    res.send("hello")
})
const PORT =process.env.PORT || 5000;
app.listen(PORT,(req,res)=>console.log(`server is running on port ${PORT}`));