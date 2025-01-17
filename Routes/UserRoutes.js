const express = require("express");
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const User = require("../model/User");
// signUpSchema in zod;
const signUpSchema = zod.object({
    username:zod.string(),
    password:zod.string(),
    firstName:zod.string(),
    lastName:zod.string(),
})

// SignUp
router.post("/signUp",async(req,res)=>{
    const body = req.body;
    const {success } = signUpSchema.safeParse(req.body);

    if(!success){
        return res.status(411).json({
            message:"Email already taken/ Incorrect inputs"
        })
    }

    const user = User.findOne({
        username:body.username
    })

    if(user._id){
        return res.status(411).json({
            message:"Email already taken/Incorrect inputs"
        })
    }

    const newUser = await User.create(body);
    const token = jwt.sign({
        userId:newUser._id
    },process.env.JWT_SECRET);

    res.status(201).json({
        message:"User created successfully",
        user:newUser,
        token:token
    })

    });







module.exports = router;