import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import env from "../config/env";
import User, { IUser } from "../models/user.model";
import { Error } from "mongoose";

// Interface for the JWT payload
interface JwtPayload {
  userId: string;
  email: string;
}

// Register a new user
const register = async (email: string, password: string): Promise<IUser> => {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Email already in use");
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user
    const user = new User({
      email,
      password: hashedPassword,
    });

    // Save the user to the database
    await user.save();

    return user;
  } catch (error: any) {
    throw new Error(`Registration failed: ${error.message}`);
  }
};

// Login a user and return a JWT token
const login = async (email: string, password: string): Promise<string> => {
  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Generate a JWT token
    const payload: JwtPayload = {
      userId: user.id.toString(),
      email: user.email,
    };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "1h" });

    return token;
  } catch (error: any) {
    throw new Error(`Login failed: ${error.message}`);
  }
};

// Export the service functions
export default {
  register,
  login,
};
