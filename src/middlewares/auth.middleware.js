import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import {User} from "../models/user.model.js"

export const verifyJWT = asyncHandler(async(req,res,next)=>
{
   try {
    // because accesstoken is like "Bearer <token>" in headers so to get it we can use it like this
    const accessToken =req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","");
                         
    if(!accessToken)
    {
     throw new ApiError(401,"Unauthorized request");
    }
 
    const decodedToken = jwt.verify(accessToken,process.env.ACCESS_TOKEN_SECRET);
 
    const user = await User.findById({_id:decodedToken?._id}).select("-password -refreshToken");
 
    if(!user)
    {
     throw new ApiError(401,"Invalid Access Token");
    }
    
    req.user=user;
    next();
   } catch (error) {
    throw new ApiError(401,error?.message || "Invalid authentication");
   }

})