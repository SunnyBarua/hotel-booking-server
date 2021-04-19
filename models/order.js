const mongoose=require("mongoose")
const {ObjectId}=mongoose.Schema

const orderSchema=mongoose.Schema({
    hotel:{
        type:ObjectId,
        ref:"Hotel",
    },
    session:{},
    orderBy:{type:ObjectId,ref:"User"},
},
{timestamps:true}
)

const Order = mongoose.model("Order",orderSchema);
module.exports = Order;