import connectDB from "../config/database";
import authService from "../services/auth.service";

const testAuth = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Test registration
    const email = "test@example.com";
    const password = "password123";
    const user = await authService.register(email, password);
    console.log("User registered:", user);

    // Test login
    const token = await authService.login(email, password);
    console.log("Login token:", token);
  } catch (error: any) {
    console.error("Test failed:", error.message);
  } finally {
    process.exit();
  }
};

testAuth();
