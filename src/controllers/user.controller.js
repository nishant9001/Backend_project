import {asyncHandler} from ".././utils/asyncHandler.js";
import {ApiResponse} from ".././utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {User} from "../models/user.model.js";

const registerUser = asyncHandler(async(req,res)=>
{
  // get email,username,fullName,password from frontend
  const {email,username,fullName,password} = req.body;
   console.log(req.body);
  // console.log(req.files);
  // validation - not empty - done as a middleware in route
     
  // check if user already exists: check by username and email

  const existUser = await User.findOne(
    {
      $or:[{username},{email}]
    }
  )
  if(existUser)
  {
    throw new ApiError(409,"User with email or username already exists");
  }

  // check for images, check for avatar

  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;
  // ? :- If the value exists[not null and not undefined] before ? then it proceeds to access the next property 
  // in the chain otherwise return undefined
 
  if(!avatarLocalPath)
  {
    throw new ApiError(400,"Avatar file is required");
  }
  
  // upload them to cloudinary,avatar
  const responseAvatar =await uploadOnCloudinary(avatarLocalPath);
  if(!responseAvatar)
  {
    throw new ApiError(400,"responseAvatar file is required");
  }

  if(!coverImageLocalPath)
    {
      throw new ApiError(400,"coverImage file is required");
    }
  const responsecoverImage =await uploadOnCloudinary(coverImageLocalPath);
  if(!responsecoverImage)
    {
      throw new ApiError(400,"responsecoverImage file is required");
    }

  // create user object - create entry in db
  const user =await User.create(
    {
      fullName,
      email,
      password,
      username: username.toLowerCase(),
      avatar:responseAvatar.url,
      coverImage:responsecoverImage?.url || ""
    }
  )
  
 
  // remove password and refresh token field from response
  const createdUser= await User.findById(user._id).select("-password -refreshToken");


   // check for user creation
  if(!createdUser)
  {
    throw new ApiError(500,"Something went wrong while registering the user");
  }
 
  // return res
  return res.status(201).json
    (
      new ApiResponse(200,createdUser,"User registered successfully")
    )
  
  }
)

export {registerUser}