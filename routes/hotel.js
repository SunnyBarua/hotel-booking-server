const express=require("express");
const {create, hotels,image, sellerHotels,remove,read,update,userHotelBookings,isAlreadyBooked}=require("../controllers/hotel");
const router=express.Router();
const formidable=require("express-formidable");
const { requireSignIn, hotelOwner } = require("../middlewares");


router.post("/create-hotel",requireSignIn,formidable(),create)
router.get("/hotels",hotels)
router.get("/hotel/image/:hotelId",image)
router.get("/seller-hotels",requireSignIn,sellerHotels)
router.delete("/delete-hotel/:hotelId",requireSignIn,hotelOwner,remove)
router.get("/hotel/:hotelId",read);
router.put("/update-hotel/:hotelId",requireSignIn,hotelOwner,formidable(),update)
router.get('/user-hotel-bookings',requireSignIn,userHotelBookings)
router.get('/is-already-booked/:hotelId',requireSignIn,isAlreadyBooked)

module.exports=router