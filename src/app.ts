import express, { Express } from "express";
import cors from "cors";
import authRoutes from "../src/routes/auth.routes";
import propertyRoutes from "./routes/property.routes";

const app: Express = express();

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Basic route for testing
app.get("/", (req, res) => {
  res.json({ message: "Property Listing System API is running!" });
});

// Placeholder for routes (to be added later)
app.use("/api/auth", authRoutes);
app.use("/api/properties", propertyRoutes);

export default app;
