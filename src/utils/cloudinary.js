import { v2 as cloudinary } from 'cloudinary'
import fs from "fs"



// Configuration
cloudinary.config({ 
    cloud_name:process.env.CLOUDINARY_CLOUD_NAME, 
    api_key:process.env.CLOUDINARY_API_KEY, 
    api_secret:process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async(localFilePath)=>
{
  try
    {
       if(!localFilePath) return null

        //upload the file on cloudinary
        const uploadresult = await cloudinary.uploader
        .upload
        (
           localFilePath, {
          //    public_id: 'shoes',
           resource_type:"auto"
           }
        )

        console.log("file is uploaded successfull on cloudinary",uploadresult.url);
        if(uploadresult)
        {
        fs.unlinkSync(localFilePath);
        }
        return uploadresult;
    } 
  catch(error)
  {
   fs.unlinkSync(localFilePath)   //remove the locally saved temporary file as the upload operation got failed
   return null;
  }
}

const deleteOnCloudinary = async(publicId)=>
  {
    try
      {
         if(!publicId) return null
  
          //upload the file on cloudinary
          const deleteresult = await cloudinary.uploader.destroy(publicId);
  
          console.log("file is deleted successfully on cloudinary",deleteresult);
          return deleteresult;
      } 
    catch(error)
    {
     console.log("file deletion unsuccessfull")
    }
  }

    
export {uploadOnCloudinary,deleteOnCloudinary}