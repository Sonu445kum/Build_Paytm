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
router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession(); // Initialize a session
    try {
      session.startTransaction();
  
      const { amount, to } = req.body;
  
      // Fetch sender's account with session
      const account = await Account.findOne({ userId: req.userId }).session(session);
  
      if (!account || account.balance < amount) {
        await session.abortTransaction(); // Abort the transaction
        return res.status(400).json({ message: "Insufficient balance" });
      }
  
      // Fetch recipient's account with session
      const toAccount = await Account.findOne({ userId: to }).session(session);
  
      if (!toAccount) {
        await session.abortTransaction(); // Abort the transaction
        return res.status(400).json({ message: "Invalid account" });
      }
  
      // Deduct amount from sender's account
      await Account.updateOne(
        { userId: req.userId },
        { $inc: { balance: -amount } }
      ).session(session);
  
      // Add amount to recipient's account
      await Account.updateOne(
        { userId: to },
        { $inc: { balance: amount } }
      ).session(session);
  
      // Commit transaction
      await session.commitTransaction();
  
      res.status(200).json({ message: "Money transferred successfully" });
    } catch (error) {
      // Roll back transaction in case of error
      await session.abortTransaction();
      console.error("Error in transfer logic:", error);
      res.status(400).json({ message: "Error in transfer logic" });
    } finally {
      session.endSession(); // Ensure the session ends
    }
  });


// exports
module.exports = router;    