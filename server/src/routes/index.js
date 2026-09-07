import { Router } from "express";

import authRouter from "../modules/auth/auth.routes.js";
import healthRouter from "../modules/health/health.routes.js";
import userRouter from "../modules/users/user.routes.js";
import postRouter from "../modules/posts/post.routes.js";
import cheerRouter from "../modules/cheers/cheer.routes.js";
import commentRouter from "../modules/comments/comment.routes.js";
import goalRouter from "../modules/goals/goal.routes.js";
import milestoneRouter from "../modules/milestones/milestone.routes.js";
import followRouter from "../modules/follows/follow.routes.js";
import helpRouter from "../modules/helps/help.routes.js";
import notificationRouter from "../modules/notifications/notification.routes.js";
import chatRouter from "../modules/chats/chat.routes.js";
import studyRoomRouter from "../modules/studyRooms/studyRoom.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/health", healthRouter);
router.use("/users", userRouter);
router.use("/posts", postRouter);
router.use("/cheers", cheerRouter);
router.use("/comments", commentRouter); 
router.use("/goals", goalRouter);
router.use("/milestones", milestoneRouter);
router.use("/follows", followRouter);
router.use("/helps", helpRouter);
router.use("/notifications", notificationRouter);
router.use("/conversations", chatRouter);
router.use("/study-rooms", studyRoomRouter);

export default router;
