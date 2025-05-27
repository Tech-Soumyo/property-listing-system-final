import { Router } from "express";
import propertyController from "../controllers/property.controller";
import authMiddleware from "../middleware/auth.middleware";

const router = Router();

// Create a new property (requires authentication)
router.post("/", authMiddleware.authenticateToken, propertyController.create);

// Get all properties (public access)
router.get("/", propertyController.getAll);

router.get("/search", propertyController.search);

// Get a property by ID (public access)
router.get("/:id", propertyController.getById);

// Update a property (requires authentication and ownership)
router.put("/:id", authMiddleware.authenticateToken, propertyController.update);

// Delete a property (requires authentication and ownership)
router.delete(
  "/:id",
  authMiddleware.authenticateToken,
  propertyController.remove
);

export default router;
