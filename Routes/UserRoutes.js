const express = require("express");
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../Middlewares/AuthMiddleware");
const User = require("../model/User");
const Account = require("../model/Account");
// signUpSchema in zod;
const signUpSchema = zod.object({
    username: zod.string().email(), // Validate username as an email
    password: zod.string().min(6, "Password must be at least 6 characters long"),
    firstName: zod.string().nonempty("First name is required"),
    lastName: zod.string().nonempty("Last name is required"),
});

// SignUp Route
router.post("/signUp", async (req, res) => {
    try {
        const body = req.body;

        // Validate the request body using the schema
        const parsedResult = signUpSchema.safeParse(body);

        if (!parsedResult.success) {
            return res.status(400).json({
                message: "Invalid inputs",
                errors: parsedResult.error.errors, // Include validation errors for better debugging
            });
        }

        // Check if the user already exists
        const existingUser = await User.findOne({ username: body.username });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already taken",
            });
        }

        // Create a new user
        const newUser = await User.create({
            username: body.username,
            password: body.password, // Consider hashing passwords with bcrypt for security
            firstName: body.firstName,
            lastName: body.lastName,
        });

        // Create a new account associated with the user
        const newAccount = await Account.create({
            userId: newUser._id,
            balance: Math.floor(1 + Math.random() * 10000), // Random balance
        });

        // Generate a JWT token
        const token = jwt.sign(
            { userId: newUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" } // Optional: set token expiration
        );

        // Respond with success
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
            },
            account: newAccount,
            token: token,
        });
    } catch (error) {
        console.error("Error in signUp logic:", error);
        res.status(500).json({
            message: "Internal Server Error",
        });
    }
});


// signIn routes
const signInBody = zod.object({
    username:zod.string().email(),
    password:zod.string(),
})

router.post("/signIn",async(req,res)=>{
    try {
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
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Internal Server Error in signIn logic"
            })
        
    }
});

//update
const updateBody = zod.object({
    password:zod.string().optional(),
    firstName:zod.string().optional(),
    lastName:zod.string().optional(),
})

router.put("/update",authMiddleware,async(req,res)=>{
    try {
        const {success} = updateBody.safeParse(req.body);
    if(!success){
        return res.status(411).json({message:"Error while updating information"})
    }
    const user = await User.findOneAndUpdate({_id:req.userId},req.body,{new:true});
    res.status(200).json({message:"User updated successfully",user:user})
    } catch (error) {
        console.log(error);
        res.status(500).json({
            
            
            message:"Internal Server Error in update logic"
            })
        
    }
});


// get all user
router.get("/bulk", async(req,res)=>{
    try {
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
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message:"Internal Server Error in bulk logic"
        })
        
    }
})





module.exports = router;