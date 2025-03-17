import {mongoose,Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const commentSchema = new Schema(
    {
       content:
       {
        type:String,
        required:true
       },
       video:
       {
        type:Schema.Types.ObjectId,
        ref:"Video"
       },
       owner:
       {
        type:Schema.Types.ObjectId,
        ref:"User"
       }
    },
    {
        timestamps:true
    }
)

commentSchema.plugin(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment",commentSchema); 
// whenever it created in mongodb then it will  save as model "Comment" 
//  as per our scehma but when it will create as a model the name will change as 
// Comment ==== > comments (first letter will be lowercase and it will be plurals automatically)