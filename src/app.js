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
app.use(express.json({linit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))

// to access and change cookies of client
app.use(cookieParser()) 

export {app}  