import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
    
    let id;
    if(userId)
    {
     id=userId;
    }
    else{
        id=req.user._id;
    }

    const videos = await Video.aggregate(
        [
        {$match:
            {
                owner:id
            }
        },
        {
            $sort:
            {
                createdAt:-1
            }
        }
        ])
    const options = {
        page,
        limit,
      };
  
      const result = await Video.aggregatePaginate(Query, options);
})


// upload video
const publishAVideo = asyncHandler(async (req, res) => {
    // TODO: get video, upload to cloudinary, create video
    const { title, description} = req.body
    console.log(req.body);
    console.log(req.files);
    if(!title || !description)
    {
        throw new ApiError(404,"title and description both needed to publish a video")
    }

    // by multer first file is saved in local by multer middleware and then we will save it in cloudinary and 
    // saved that file url for future reference
    const videoLocalPath= req.files?.videoFile[0]?.path;
    const thumbnailLocalPath= req.files?.thumbnail[0]?.path;
     
      if(!videoLocalPath)
      {
        throw new ApiError(400,"Video file is required");
      }
      
      // upload them to cloudinary,video
      const responsevideo =await uploadOnCloudinary(videoLocalPath);
      if(!responsevideo)
      {
        throw new ApiError(400,"responsevideo file is required");
      }
    
      if(!thumbnailLocalPath)
        {
          throw new ApiError(400,"thumbnail file is required");
        }
      const responsethumbnail =await uploadOnCloudinary(thumbnailLocalPath);
      if(!responsethumbnail)
        {
          throw new ApiError(400,"responsethumbnail file is required");
        }
        let seconds =responsevideo.duration;
        function formatDuration(seconds) {
            const h = Math.floor(seconds / 3600);
            const m = Math.floor((seconds % 3600) / 60);
            const s = Math.floor(seconds % 60);
            return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
          }

    const video = await Video.create(
        {
            title,
            description,
            owner:req.user._id,
            videoFile:responsevideo?.url,
            thumbnail:responsethumbnail?.url,
            duration:formatDuration(seconds)
        }
    )

    return res.status(200)
    .json(
        new ApiResponse(201,video,"video published successfully")
    )
   
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    if(!videoId)
    {
        throw new ApiError(404,"videoId is required");
    }

    const video = await Video.findById(videoId,{isPublished:0});
    
    if(!video)
    {
        throw new ApiError(400,"videoId is not valid");
    }

    return res.json(200)
    .json(
        new ApiResponse(200,video,"Video fetched Successfully")
    )
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

    if(!videoId)
        {
            throw new ApiError(404,"videoId is required");
        }
    
        const video = await Video.findByIdAndUpdate(videoId,req.body,
            {
                new:true,
                runValidators: true, 
                validateModifiedOnly: true  // Only validate modified fields});
            })
        if(!video)
        {
            throw new ApiError(400,"videoId is not valid");
        }
    
        return res.json(200)
        .json(
            new ApiResponse(200,video,"Video details update Successfully")
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId)
        {
            throw new ApiError(404,"videoId is required");
        }
    
        const video = await Video.findByIdAndDelete(videoId);
        
        if(!video)
        {
            throw new ApiError(400,"videoId is not valid");
        }
    
        return res.json(200)
        .json(
            new ApiResponse(200,"Video deleted Successfully")
        )
})

// To set the video visibility status
const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}
