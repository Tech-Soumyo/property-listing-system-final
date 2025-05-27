import propertyService from "../services/property.service";
import authService from "../services/auth.service";
import connectDB from "../config/database";

const testProperty = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Register a user to get a userId
    const email = "test3@example.com";
    const password = "password123";
    const user = await authService.register(email, password);
    const userId = user.id.toString();
    console.log("User registered:", user);

    // Create a property
    const newProperty = await propertyService.create(
      {
        externalId: "TESTPROP1",
        title: "Test Property",
        type: "Apartment",
        price: 1000000,
        state: "Test State",
        city: "Test City",
        areaSqFt: 1000,
        bedrooms: 2,
        bathrooms: 1,
        amenities: ["gym", "pool"],
        furnished: "Furnished",
        availableFrom: new Date("2025-12-01"),
        listedBy: "Owner",
        tags: ["test", "luxury"],
        colorTheme: "test-theme#ffffff",
        rating: 4.5,
        isVerified: true,
        listingType: "sale",
      },
      userId
    );
    console.log("Property created:", newProperty);

    // Get all properties
    const properties = await propertyService.getAll();
    console.log("All properties:", properties);

    // Get property by ID
    const property = await propertyService.getById(newProperty.id.toString());
    console.log("Property by ID:", property);

    // Update the property
    const updatedProperty = await propertyService.update(
      newProperty.id.toString(),
      userId,
      {
        price: 1200000,
        title: "Updated Test Property",
      }
    );
    console.log("Property updated:", updatedProperty);

    // Delete the property
    await propertyService.remove(newProperty.id.toString(), userId);
    console.log("Property deleted");

    // Verify deletion
    const deletedProperty = await propertyService
      .getById(newProperty.id.toString())
      .catch(() => null);
    console.log("Deleted property (should be null):", deletedProperty);
  } catch (error: any) {
    console.error("Test failed:", error.message);
  } finally {
    process.exit();
  }
};

testProperty();
