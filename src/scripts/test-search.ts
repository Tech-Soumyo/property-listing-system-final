import connectDB from "../config/database";
import propertyService from "../services/property.service";
import "../models/user.model"; // Import User model to register it with Mongoose

const testSearch = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Test 1: Search by title
    console.log('Searching by title "Green"...');
    let results = await propertyService.search({ title: "Green" });
    console.log(
      "Results:",
      results.map((p) => p.title)
    );

    // Test 2: Search by price range
    console.log("Searching by price range 1,000,000 to 25,000,000...");
    results = await propertyService.search({
      priceMin: 1000000,
      priceMax: 25000000,
    });
    console.log(
      "Results:",
      results.map((p) => ({ title: p.title, price: p.price }))
    );

    // Test 3: Search by state and city
    console.log('Searching by state "Tamil Nac" and city "Coimbatore"...');
    results = await propertyService.search({
      state: "Tamil Nac",
      city: "Coimbatore",
    });
    console.log(
      "Results:",
      results.map((p) => p.title)
    );

    // Test 4: Search by bedrooms and bathrooms
    console.log("Searching by bedrooms=5 and bathrooms=2...");
    results = await propertyService.search({ bedrooms: 5, bathrooms: 2 });
    console.log(
      "Results:",
      results.map((p) => p.title)
    );

    // Test 5: Search by listingType
    console.log('Searching by listingType "rent"...');
    results = await propertyService.search({ listingType: "rent" });
    console.log(
      "Results:",
      results.map((p) => p.title)
    );

    // Test 6: Combined search
    console.log(
      'Combined search: priceMax=25,000,000, listingType="rent", city="Coimbatore"...'
    );
    results = await propertyService.search({
      priceMax: 25000000,
      listingType: "rent",
      city: "Coimbatore",
    });
    console.log(
      "Results:",
      results.map((p) => p.title)
    );
  } catch (error: any) {
    console.error("Test failed:", error);
  } finally {
    process.exit();
  }
};

testSearch();
