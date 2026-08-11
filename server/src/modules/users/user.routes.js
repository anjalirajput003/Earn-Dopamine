import { Router } from "express";
import {
  updateUserProfile,
  updateUserAvatar,
  updateUserCoverImage,
  getUserProfile,
  searchAllUsers,
  checkUsername,
} from "./user.controller.js";
import {
  updateProfileSchema,
  getUserByUsernameSchema,
  searchUsersSchema,
  checkUsernameSchema,
} from "./user.validation.js";
import validate from "../../middlewares/validate.middleware.js";
import verifyJWT from "../../middlewares/auth.middleware.js";
import upload from "../../middlewares/upload.middleware.js";
import followRouter from "../follows/follow.routes.js";

const router = Router();

//profile update route
router.patch(
  "/profile",
  verifyJWT,
  validate(updateProfileSchema),
  updateUserProfile,
);

//avatar upload
router.patch("/avatar", verifyJWT, upload.single("avatar"), updateUserAvatar);

//cover image
router.patch(
  "/cover-image",
  verifyJWT,
  upload.single("coverImage"),
  updateUserCoverImage,
);

//we are putting this follow route here instead of index.js where all routes belong because we already have /users route so we can't make 2 because follow route falls under users route we are putting it here
router.use("/", followRouter);

//search route
router.get("/search", verifyJWT, validate(searchUsersSchema), searchAllUsers);

//check username
router.get("/check-username", validate(checkUsernameSchema), checkUsername);

//get user from username
router.get("/:username", validate(getUserByUsernameSchema), getUserProfile);

export default router;
