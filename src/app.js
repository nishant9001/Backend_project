import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app=express();
app.use(cors(
    {
        origin:process.env.CORS_ORIGIN,
        credentials:true
    }
))

//middlewares for handling the receiving data in different formats 
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

// to access and change cookies of client
app.use(cookieParser()) 


//routes
import userRouter from "./routes/user.routes.js"

//routes declaration   
app.use("/api/v1/users",userRouter)      // use middleware to redirect the route

export {app}  