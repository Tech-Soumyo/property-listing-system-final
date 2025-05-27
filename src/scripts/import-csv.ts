import { parse } from "csv-parse";
import connectDB from "../config/database";
import Property from "../models/property.model";
import axios from "axios";

// URL of the CSV file
const CSV_URL = "https://cdn2.gro.care/db424fd9fb74_1748258398689.csv";

// Function to parse date strings (e.g., "14-10-2025" to Date)
const parseDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day); // Month is 0-indexed in JavaScript
};

// Main function to import CSV
const importCSV = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Fetch CSV data from the URL
    const response = await axios.get(CSV_URL, { responseType: "text" });
    const csvData = response.data;

    // Parse CSV
    const records: any[] = [];
    const parser = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    parser.on("readable", () => {
      let record;
      while ((record = parser.read()) !== null) {
        records.push(record);
      }
    });

    parser.on("error", (err) => {
      console.error("Error parsing CSV:", err);
      process.exit(1);
    });

    parser.on("end", async () => {
      try {
        // Transform and insert records into MongoDB
        const properties = records.map((record) => ({
          externalId: record.id,
          title: record.title,
          type: record.type,
          price: parseFloat(record.price),
          state: record.state,
          city: record.city,
          areaSqFt: parseInt(record.areaSqFt, 10),
          bedrooms: parseInt(record.bedrooms, 10),
          bathrooms: parseInt(record.bathrooms, 10),
          amenities: record.amenities ? record.amenities.split("|") : [],
          furnished: record.furnished as "Unfurnished" | "Furnished" | "Semi",
          availableFrom: parseDate(record.availableFrom),
          listedBy: record.listedBy as "Builder" | "Owner" | "Agent",
          tags: record.tags ? record.tags.split(",") : [],
          colorTheme: record.colorTheme,
          rating: parseFloat(record.rating),
          isVerified: record.isVerified.toLowerCase() === "true",
          listingType: record.listingType as "rent" | "sale",
          createdBy: "default-user-id", // Temporary placeholder; update after Task 3
        }));

        // Clear existing data (optional, for testing)
        await Property.deleteMany({});

        // Insert parsed data into MongoDB
        await Property.insertMany(properties);

        console.log(`${properties.length} properties imported successfully`);
        process.exit(0);
      } catch (error) {
        console.error("Error importing properties:", error);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Error fetching CSV:", error);
    process.exit(1);
  }
};

// Run the import script
importCSV();
