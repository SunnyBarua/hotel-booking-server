const express=require("express");

const { createConnectAccount, getAccountStatus ,stripeSessionId,stripeSuccess,payoutSetting, getAccountBalance} = require("../controllers/stripe");
const { requireSignIn } = require("../middlewares");

const router=express.Router();

router.post('/create-connect-account',requireSignIn,createConnectAccount)
router.post('/get-account-status',requireSignIn,getAccountStatus)
router.post('/get-account-balance',requireSignIn,getAccountBalance)
router.post('/stripe-session-id',requireSignIn,stripeSessionId)
router.post('/stripe-success',requireSignIn,stripeSuccess)

router.post("/payout-setting",requireSignIn,payoutSetting)

module.exports=router