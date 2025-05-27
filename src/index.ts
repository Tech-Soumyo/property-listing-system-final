import app from "./app";
import connectDB from "./config/database";
import "./config/redis"; // Importing to ensure Redis connects
import env from "./config/env";

const PORT = parseInt(env.PORT, 10) || 3000;

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    // Start the Express server
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

startServer();
