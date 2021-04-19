const Stripe =require("stripe");
const queryString =require("query-string");
const User=require("../models/user")
const Hotel=require("../models/hotel")
const Order=require("../models/order")

const stripe = Stripe('sk_test_51Ib9SxKUsbdFeLgsdTbNltwOrH3GJoohCmfU2REYSuyKhtROx4qigfrA70eKWyS6zTHcW1DeNEOEjhze6Mc1u5s700xqeDuoSg');

exports.createConnectAccount = async (req, res) => {

  try{
    const user = await User.findById(req.user._id).exec();
    console.log("USER ==> ", user);
  
    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({
        type: "express",
      });
      console.log("ACCOUNT ===> ", account);
      user.stripe_account_id = account.id;
      user.save();
    }
    let accountLink=await stripe.accountLinks.create({
      account:user.stripe_account_id,
      refresh_url:process.env.STRIPE_REDIRECT_URL,
      return_url:process.env.STRIPE_REDIRECT_URL,
      type:"account_onboarding"
    });
    accountLink=Object.assign(accountLink,{
      "stripe_user[email]":user.email || undefined,
    })
    let link=`${accountLink.url}?${queryString.stringify(accountLink)}`;
    console.log("LOGIN LINK",link);
    res.send(link);
    

  }catch(err){
      console.log(err)
  }
 
};

const updateDelayDay=async(accountId)=>{
  const account=await stripe.accounts.update(accountId,{
    settings:{
      payouts:{
        schedule:{
          delay_days:7,
        }
      }
    }
  });
  return account;
}

exports.getAccountStatus=async(req,res)=>{
  try{
  const user=await User.findById(req.user._id).exec();
  const account=await stripe.accounts.retrieve(user.stripe_account_id)
  console.log("USER ACCOUNT RETRIEVE",account)

  const updatedAccount=await updateDelayDays(account.id)

  const updatedUser=await User.findByIdAndUpdate(user._id,
    {
    stripe_seller:updatedAccount,
  },
  {new:true}
  ).select("-password")
   .exec();
   res.json(updatedUser)

  }catch(err){
    console.log(err)
  }
};

exports.getAccountBalance=async(req,res)=>{
  const user=await User.findById(req.user._id).exec();
  try{
    const balance=await stripe.balance.retrieve({
      stripeAccount:user.stripe_account_id,
    })
    console.log("BALANCE ===>",balance)
    res.json(balance)
  }catch(err){
    console.log(err)
  }

}

exports.stripeSessionId=async(req,res)=>{
  console.log("You hit stripe ")
  const {hotelId}=req.body;
  const item=await Hotel.findById(hotelId).populate('postedBy').exec();
  const fee=(item.price*20)/100;

  const session=await stripe.checkout.sessions.create({
    payment_method_types:['card'],
    line_items:[
      {
        name:"Hotel Booking",
        amount:item.price*100,
        currency:"usd",
        quantity:1,
      }
    ],
    payment_intent_data:{
      application_fee_amount:fee*100,
      transfer_data:{
        destination:item.postedBy.stripe_account_id,
      },
    },
    success_url:`${process.env.STRIPE_SUCCESS_URL}/${item._id}`,
    cancel_url:process.env.STRIPE_CANCEL_URL
  })
  await User.findByIdAndUpdate(req.user._id,{stripeSession:session}).exec()
  res.send({
    sessionId:session.id,
  })
  console.log("SESSION ===>>>",session)
}

exports.stripeSuccess=async(req,res)=>{
 try{
  const {hotelId}=req.body
  const user=await User.findById(req.user._id).exec()

  if(!user.stripeSession) return;

  const session=await stripe.checkout.sessions.retrieve(user.stripeSession.id);
  if(session.payment_status==="paid"){
    const orderExist=await Order.findOne({"session.id":session.id}).exec()
    if(orderExist){
      res.json({success:true});
    }else{
      let newOrder=await new Order({
        hotel:hotelId,
        session,
        orderedBy:user._id,
      }).save()
      await User.findByIdAndUpdate(user._id,{
        $set:{stripeSession:{}},
      });
      res.json({success:true})
    }
  }
 }catch(err){
   console.log("STRIPE SUCCESS ERR",err)
 }

}
exports.payoutSetting=async(req,res)=>{
  try{
    const user=await User.findById(req.user._id).exec();
    const loginLink=await stripe.accounts.createLoginLink(user.stripe_account_id,
      {
      redirect_url:process.env.STRIPE_SETTING_REDIRECT_URL,
    }
    );
    console.log("LOGIN LINK FOR PAYOUT SETTING",loginLink)
    res.json(loginLink)

  }catch(err){
    console.log('STRIPE PAYOUT SETTING ERR',err)
  }
}