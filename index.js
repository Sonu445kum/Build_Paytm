const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const bodyParser = require("body-parser");
const connectDB = require("./DB/index");
connectDB();
// middlewares

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


//Routes;
const userRoutes = require("./Routes/UserRoutes");
app.use("/api/v1",userRoutes);
const AccountRoutes = require("./Routes/AccountRoutes.js");
app.use("/account",AccountRoutes);
app.get("/",(req,res)=>{
    res.send("hello")
})
const PORT =process.env.PORT || 5000;
app.listen(PORT,(req,res)=>console.log(`server is running on port ${PORT}`));