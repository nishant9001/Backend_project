import {Router} from "express"
import 
{
    registerUser,
    loginUser,logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js";
import {validateUser} from "../validators/user.validator.js"
import {handleValidation} from "../middlewares/handlevalidation.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"


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


router.route("/login").post(
    validateUser.loginUser,
    handleValidation,
    loginUser
)

//secured routes
router.route("/logout").post(
    verifyJWT,
    logoutUser
)

router.route("/refresh").post(refreshAccessToken);

router.route("/changepassword").patch
(
    verifyJWT,
    changeCurrentPassword
);

router.route("/getUser").get(
    verifyJWT,
    getCurrentUser
)

router.route("/updateUser").patch(
    verifyJWT,
    updateUserDetails
)

router.route("/updateAvatar").patch(
    verifyJWT,
    upload.single("avatar"),
    updateUserAvatar
)

router.route("/updateCoverImage").patch(
    verifyJWT,
    upload.single("CoverImage"),
    updateUserCoverImage
)

router.route("/getUserProfile/c/:username").get
(
    verifyJWT,
    getUserChannelProfile
)   // give id of user whom channel u r in (in params)

router.route("/getWatchHistory").get
(
    verifyJWT,
    getWatchHistory
)

export default router;