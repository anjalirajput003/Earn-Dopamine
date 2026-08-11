import { Router } from "express";

import authRouter from "../modules/auth/auth.routes.js";
import healthRouter from "../modules/health/health.routes.js";
import userRouter from "../modules/users/user.routes.js";
import postRouter from "../modules/posts/post.routes.js";
import followRouter from "../modules/follows/follow.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/health", healthRouter);
router.use("/users", userRouter);
router.use("/posts", postRouter);

export default router;
