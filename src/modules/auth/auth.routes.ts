import { Router } from "express";
import { authenticate } from "../../middlewares/auth.js";
import * as authController from "./auth.controller.js";

const authRoutes = Router();

authRoutes.post("/register", authController.register);
authRoutes.post("/login", authController.login);
authRoutes.get("/me", authenticate, authController.getMe);

export default authRoutes;
