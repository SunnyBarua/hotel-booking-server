const express=require("express")
const router = require("./routes/auth")
const stripeRouter = require("./routes/stripe")
const hotelRouter=require("./routes/hotel")
const cors=require("cors")
const mongoose=require("mongoose")
require('dotenv').config();
const morgan=require("morgan")
const app=express()
app.use(express.json());
app.use(cors())
app.use(morgan("dev"));

app.use("/api",router)
app.use("/api",stripeRouter)
app.use("/api",hotelRouter)

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  });
  mongoose.connection.on("connected", () => {
    console.log("connected to mongo!!!");
  });
  mongoose.connection.on("error", (err) => {
    console.log("err connecting!!", err);
  });

const port=process.env.PORT || 4500

app.listen(port,()=>console.log(`Server is runing on ${port}`))


