const express = require("express");

const Account = require("../model/Account.js");
const authMiddleware = require("../Middlewares/AuthMiddleware.js");
const { default: mongoose } = require("mongoose");
const router = express.Router();

//get balance
router.get("/balance",authMiddleware,async(req,res)=>{

   try {
    const account = await Account.findOne({
        userId:req.userId
    });

    res.status(200).json({
        balance:account.balance
    })
    
   } catch (error) {
    console.log(error);
    res.status(400).json({message:"Error in balance logic"});
    
   }

});


// transfer money
router.post("/transfer",authMiddleware,async(req,res)=>{

   try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const {amount,to} = req.body;
    const account = await Account.findOne({userId:req.userId}.session(session));

    if(!account || account.balance < amount){
        await session.abortTransaction();
        return res.status(400).json({message:"Insufficient balance"});
    }

    // perform transaction
    const toAccount = await Account.findOne({userId:to}.session(session));
    if(!toAccount){
        await session.abortTransaction();
        return res.status(400).json({message:"Invalid Account"});
    }

    await Account.updateOne({userId:req.userId},{$inc:{balance:-amount}}.session(session));
    await Account.updateOne({userId:to},{$inc:{balance:amount}}.session(session));

    // commit transaction
    await session.commitTransaction();
    // await session.endSession();
    res.status(200).json({message:"Money transferred successfully"});
    
   } catch (error) {
    // if error in the above logic then show message below
    await session.abortTransaction();
    console.log(error);
    res.status(400).json({message:"Error in transfer logic"});
    
   }
    
})



// exports
module.exports = router;    