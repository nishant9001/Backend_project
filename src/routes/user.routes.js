import {Router} from "express"
import {registerUser} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {validateUser} from "../validators/user.validator.js"
import {handleValidation} from "../middlewares/handlevalidation.middleware.js"

const router = Router();

router.route("/register").post(
    upload.fields([
        {
         name:"avatar",  // name of file you want to store by multer
         maxCount:1      // no of avatar files you want to accept
        },
        {
        name:"coverImage",
        maxCount:1
        }
    ]),
    validateUser.registerUser,
    handleValidation,
    registerUser
);

export default router;