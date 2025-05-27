import { Request, Response } from "express";
import authService from "../services/auth.service";

// Register a new user
const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await authService.register(email, password);
    res.status(201).json({
      message: "User registered successfully",
      user: { id: user._id, email: user.email },
    });
    return;
  } catch (error: any) {
    res.status(400).json({ message: error.message });
    return;
  }
};

// Login a user and return a JWT token
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Basic validation
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const token = await authService.login(email, password);
    res.status(200).json({ message: "Login successful", token });
    return;
  } catch (error: any) {
    res.status(401).json({ message: error.message });
    return;
  }
};

export default {
  register,
  login,
};
