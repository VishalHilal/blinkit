import dotenv from 'dotenv'
dotenv.config()

import express from 'express'
import Stripe from 'stripe'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import helmet from 'helmet'
import connectDB from './config/connectDB.js'
import userRouter from './route/user.route.js'
import categoryRouter from './route/category.route.js'
import uploadRouter from './route/upload.router.js'
import subCategoryRouter from './route/subCategory.route.js'
import productRouter from './route/product.route.js'
import cartRouter from './route/cart.route.js'
import addressRouter from './route/address.route.js'
import orderRouter from './route/order.route.js'


const app = express()


app.set("view engine","ejs")
app.use(cors({
    origin: "https://blinkit-drab.vercel.app",
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())
app.use(cookieParser())
app.use(morgan("dev"))
app.use(helmet({
    crossOriginResourcePolicy : false
}))

const PORT =process.env.PORT; 

app.get("/",(request,response)=>{
    ///server to client
    response.json({
        message : "Server is running " + PORT
    })
})



app.use('/api/user',userRouter)
app.use("/api/category",categoryRouter)
app.use("/api/file",uploadRouter)
app.use("/api/subcategory",subCategoryRouter)
app.use("/api/product",productRouter)
app.use("/api/cart",cartRouter)
app.use("/api/address",addressRouter)
app.use('/api/order',orderRouter)


app.get('/success', (req, res) => {
  const message = req.query.text || "Payment";
  res.render('success.ejs', { 
    text: message,
    frontendUrl: 'https://blinkit-drab.vercel.app'
  });
});

app.get('/cancel', (req, res) => {
  const message = req.query.text || "Payment";
  res.render('cancel.ejs', { 
    text: message,
    frontendUrl:'https://blinkit-drab.vercel.app'
 });
});


connectDB().then(()=>{
    app.listen(PORT,()=>{
        console.log("Server is running",PORT)
    })
})

