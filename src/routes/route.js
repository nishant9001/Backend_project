import userRouter from './user.routes.js'
import healthcheckRouter from "./healthcheck.routes.js"
import tweetRouter from "./tweet.routes.js"
import subscriptionRouter from "./subscription.routes.js"
import videoRouter from "./video.routes.js"
import commentRouter from "./comment.routes.js"
import likeRouter from "./like.routes.js"
import playlistRouter from "./playlist.routes.js"
import dashboardRouter from "./dashboard.routes.js"
import Router from "express";

const router =Router();

//routes declaration
router.use("/healthcheck", healthcheckRouter)
router.use("/users", userRouter)    // use middleware to redirect the route
router.use("/tweets", tweetRouter)
router.use("/subscriptions", subscriptionRouter)
router.use("/videos", videoRouter)
router.use("/comments", commentRouter)
router.use("/likes", likeRouter)
router.use("/playlist", playlistRouter)
router.use("/dashboard", dashboardRouter)

export default router;