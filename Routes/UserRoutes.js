const express = require("express");
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../Middlewares/AuthMiddleware");
const User = require("../model/User");
// signUpSchema in zod;
const signUpSchema = zod.object({
    username:zod.string(),
    password:zod.string(),
    firstName:zod.string(),
    lastName:zod.string(),
})

// SignUp
router.post("/signUp", async(req,res)=>{
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

// signIn routes
const signInBody = zod.object({
    username:zod.string().email(),
    password:zod.string(),
})

router.post("/signIn",async(req,res)=>{
    const {success} = signInBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({message:"Incorrect inputs"
        })
    }

    const user= await User.findOne({
        username:req.body.username,
        password:req.body.password
    });
    if(user){
        const token = jwt.sign({
            userId:user._id

        },process.env.JWT_SECRET);
        res.status(200).json({
            message:"User logged in successfully",
            user:user,
            token:token
        })
       
    }else{
        return res.status(401).json({message:"Incorrect username or password"})
    }
});

//update
const updateBody = zod.object({
    password:zod.string().optional(),
    firstName:zod.string().optional(),
    lastName:zod.string().optional(),
})

router.put("/update",authMiddleware,async(req,res)=>{
    const {success} = updateBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({message:"Error while updating information"})
    }
    const user = await User.findOneAndUpdate({_id:req.userId},req.body,{new:true});
    res.status(200).json({message:"User updated successfully",user:user})
})


// get all user
router.get("/bulk", async(req,res)=>{
    const filter = req.query.filter || "";
    const users = await User.find({
        $or:[{
            firstName:{
                $regex:filter
            }
    },{
        lastName:{
            $regex:filter
            }
    }]
    })
    res.status(200).json({
        user:users.map(user=>({
            username:user.username,
            firstName:user.firstName,
            lastName:user.lastName,
            _id:user._id
        }))
    })
})





module.exports = router;