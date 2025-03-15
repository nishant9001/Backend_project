import {asyncHandler} from ".././utils/asyncHandler.js";
import {ApiResponse} from ".././utils/ApiResponse.js";
import {ApiError} from "../utils/ApiError.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import {User} from "../models/user.model.js";
import jwt from "jsonwebtoken";

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

const loginUser =asyncHandler(async(req,res)=>
{
  // req body -> data 
  console.log(req.body)
  const {username,email,password} = req.body;
  if(!(username || email))
    {
      throw new ApiError(400,"username or email is required");
    }

  //* username or email is exist in db or not 
  const user = await User.findOne({$or:[{username},{email}]});
  if(!user)
  {
    throw new ApiError(400,"User Not found");
  }

  //* check password 
  const ispasswordValid = await user.isPasswordCorrect(password);
  if(!ispasswordValid)
    {
      throw new ApiError(401,"Invalid user credentials");
    }

  // access and refresh token 

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  
  user.refreshToken=refreshToken;
  await user.save({validateBeforeSave: false}); // because without this our schema checks its validation on every field 
  
  // send cookies
  //user.refreshtoken=refreshToken; 
  //console.log(user);

  
  // bydefault cookies can be modified.but with this object it can only modifies by backend now for security sake 
  const options =
  {  
  httpOnly:true,
  secure:true
  }

   // return res 
  return res.status(200)
  .cookie("accessToken",accessToken, options)
  .cookie("refreshToken",refreshToken, options)
  .json(
    new ApiResponse(200,{user:user,accessToken,refreshToken},"User logged In Successfully")
  )

 
})

const logoutUser = asyncHandler(async(req,res)=>
{
  const user = req.user;
  console.log(user);
  await User.findByIdAndUpdate(
    user._id,
    {
      $unset:
      {refreshToken:""}
    },
    {new:true})

    const options = {
      httpOnly:true,
      secure:true
    }

    return res.status(200)
    .clearCookie("accessToken",options)
    .clearCookie("refreshToken", options)
    .json(
       new ApiResponse(200,{},"User logged out ")
    )
  
})

const refreshAccessToken = asyncHandler(async(req,res)=>
{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
   
  if(!incomingRefreshToken)
  {
    throw new ApiError(401,"Unauthorized request");
  }

  const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET);
  console.log(decodedToken);
 
  const user = await User.findById(decodedToken._id);
  if(!user)
    {
      throw new ApiError(401,"Invalid refreshToken");
    }

   if(user.refreshToken!=incomingRefreshToken)
   {
    throw new ApiError(401,"Expired refreshToken");
   }

   const options=
   {
    httpOnly:true,
    secure:true
   }
   const accessToken = await user.generateAccessToken();
   const refreshToken = await user.generateRefreshToken();

   user.refreshToken=refreshToken;
   user.save({validateBeforeSave: false});
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken", refreshToken,options)
  .json(
    new ApiResponse(200,{accessToken,refreshToken},"everything is under control")
  )
})

const changeCurrentPassword = asyncHandler(async(req,res)=>
{
  console.log(req.user);
  const {currentPassword,newPassword} = req.body;
  console.log(req.body);
  const user=await User.findById(req.user._id);
  console.log(user);

  const ans=await user.isPasswordCorrect(currentPassword);
  if(!ans)
  {
    throw new ApiError(401,"currentPassword is Incorrect");
  }

  user.password = newPassword;
  await user.save({validateBeforeSave: false});

  const accessToken=await user.generateAccessToken();
  const refreshToken=await user.generateRefreshToken();

  const options={
    httpsOnly:true,
    secure:true
  }
  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(
    new ApiResponse(200,"Password changed successfully")
  )


})

const getCurrentUser= asyncHandler(async(req,res)=>
{
  return res.status(200)
  .json(
    new ApiResponse(200,req.user,"current user fetched succesfully")
  )
})

const updateUserDetails = asyncHandler(async(req,res)=>
{
 console.log(req.user);
 const {fullName,email} = req.body;

 let arr={};
 if(fullName)
 {
  arr.fullName=fullName
 }
 if(email)
 {
  arr.email=email;
 }
 const user=await User.findByIdAndUpdate(req.user._id,
  {
    $set:arr
  },
  {
    new:true
  }
 ).select("-password")

 return res.status(200)
 .json( new ApiResponse(200,user,"updated successfully"))

})

const updateUserAvatar = asyncHandler(async(req,res)=>
{
  //console.log(req.file);
  const avatarLocalPath = req.file?.path;

  if(!avatarLocalPath)
  {
    throw new ApiError(401,"avatarfilepath not available")
  }
  const responseAvatar = await uploadOnCloudinary(avatarLocalPath);
 // console.log(responseAvatar);
  if(!responseAvatar.url)
  {
    throw new ApiError(401,"error while uploading the file on cloudinary")
  }
  const user=await User.findByIdAndUpdate(req.user._id,
    {$set:
      {
        avatar:responseAvatar.url
      }
    },
    {new:true}
  ).select("-password")

  return res.status(200)
  .json(
    new ApiResponse(200,user,"avatar updated successfully")
  )
})

const updateUserCoverImage = asyncHandler(async(req,res)=>
  {
    const CoverImageLocalPath = req.file?.path;
  
    if(!CoverImageLocalPath)
    {
      throw new ApiError(401,"CoverImagefilepath not available")
    }
    const responseCoverImage = await uploadOnCloudinary(CoverImageLocalPath);
  
    if(!responseCoverImage.url)
    {
      throw new ApiError(401,"error while uploading the file on cloudinary")
    }
    const user=await User.findByIdAndUpdate(req.user._id,
      {$set:
        {
          avatar:responseCoverImage.url
        }
      },
      {new:true}
    ).select("-password")
  
    return res.status(200)
    .json(
      new ApiResponse(200,user,"CoverImage updated successfully")
    )
  })

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateUserDetails,
  updateUserAvatar,
  updateUserCoverImage}