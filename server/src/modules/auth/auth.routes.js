import { Router } from "express";

import {
  login,
  register,
  logout,
  refreshToken,
  getMe,
} from "./auth.controller.js";

import {
  loginSchema,
  registerSchema,
} from "./auth.validation.js";
import validate from "../../middlewares/validate.middleware.js";
import verifyJWT from "../../middlewares/auth.middleware.js";

const router = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", verifyJWT, logout);
router.post("/refresh-token", refreshToken);
router.get("/me", verifyJWT, getMe);

export default router;
