const mongoose=require("mongoose")
const {ObjectId}=mongoose.Schema

const hotelSchema=mongoose.Schema({
      title:{
          type:String,
          required:'Title is required'
      },
      content:{
        type:String,
        required:'Content is required',
        maclength:1000,
    },
    location:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:'Price is required',
        trim:true,
    },
    postedBy:{
        type:ObjectId,
        ref:"User"
    },
    image:{
        data:Buffer,
        contentType:String,
       
    },
    from:{
        type:Date,
       
    },
    to:{
        type:Date,
        
    },
    bed:{
        type:Number,
       
    },
},{timestamps:true}
);
const Hotel = mongoose.model("Hotel",hotelSchema);
module.exports = Hotel;