import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import env from "../config/env";

interface AuthUser {
  userId: string;
  email: string;
}

// Extend the Request type to include the user property
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Verify JWT token
const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: "Access token is required" });
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    req.user = decoded; // Attach user info to the request
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
    return;
  }
};

// Middleware to check if the authenticated user is the creator of a resource
const checkOwnership = (user: AuthUser, resourceCreatorId: string) => {
  if (!user || user.userId !== resourceCreatorId.toString()) {
    throw new Error("You are not authorized to perform this action");
  }
};

export default {
  authenticateToken,
  checkOwnership,
};
