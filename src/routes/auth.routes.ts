import { Router } from "express";
import authController from "../controllers/auth.controller";

const router = Router();

// Register a new user
router.post("/register", authController.register);

// Login a user
router.post("/login", authController.login);

export default router;
