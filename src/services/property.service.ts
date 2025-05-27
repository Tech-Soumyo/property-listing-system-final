import Property, { IProperty } from "../models/property.model";
import authMiddleware from "../middleware/auth.middleware";
import redis from "../config/redis";
// Interface for search parameters
export interface SearchParams {
  title?: string; // Text search on title
  priceMin?: number; // Minimum price
  priceMax?: number; // Maximum price
  state?: string; // Filter by state
  city?: string; // Filter by city
  bedrooms?: number; // Exact match for bedrooms
  bathrooms?: number; // Exact match for bathrooms
  listingType?: "rent" | "sale"; // Filter by listing type
}

// Cache key patterns
const CACHE_KEYS = {
  ALL_PROPERTIES: "properties:all",
  PROPERTY_BY_ID: (id: string) => `property:${id}`,
  SEARCH: (params: string) => `properties:search:${params}`,
};

// Cache TTL (in seconds)
const CACHE_TTL = 60 * 5; // 5 minutes

// Create a new property
const create = async (
  propertyData: Partial<IProperty>,
  userId: string
): Promise<IProperty> => {
  try {
    // Add the user ID as the creator of the property
    const property = new Property({
      ...propertyData,
      createdBy: userId,
    });

    await property.save();
    return property;
  } catch (error: any) {
    throw new Error(`Failed to create property: ${error.message}`);
  }
};

const stringifySearchParams = (params: SearchParams): string => {
  return JSON.stringify(params, Object.keys(params).sort());
};

// Get all properties
const getAll = async (): Promise<IProperty[]> => {
  try {
    const properties = await Property.find().populate("createdBy", "email");
    return properties;
  } catch (error: any) {
    throw new Error(`Failed to fetch properties: ${error.message}`);
  }
};

// Get a property by ID
const getById = async (id: string): Promise<IProperty | null> => {
  try {
    const property = await Property.findById(id).populate("createdBy", "email");
    if (!property) {
      throw new Error("Property not found");
    }
    return property;
  } catch (error: any) {
    throw new Error(`Failed to fetch property: ${error.message}`);
  }
};

// Update a property (only by the creator)
const update = async (
  id: string,
  userId: string,
  updateData: Partial<IProperty>
): Promise<IProperty | null> => {
  try {
    // Fetch the property
    const property = await Property.findById(id);
    if (!property) {
      throw new Error("Property not found");
    }

    // Check if the authenticated user is the creator
    authMiddleware.checkOwnership(
      { userId, email: "" },
      property.createdBy.toString()
    );

    // Update the property
    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    return updatedProperty;
  } catch (error: any) {
    throw new Error(`Failed to update property: ${error.message}`);
  }
};

// Delete a property (only by the creator)
const remove = async (id: string, userId: string): Promise<void> => {
  try {
    // Fetch the property
    const property = await Property.findById(id);
    if (!property) {
      throw new Error("Property not found");
    }

    // Check if the authenticated user is the creator
    authMiddleware.checkOwnership(
      { userId, email: "" },
      property.createdBy.toString()
    );

    // Delete the property
    await Property.findByIdAndDelete(id);
  } catch (error: any) {
    throw new Error(`Failed to delete property: ${error.message}`);
  }
};

const search = async (params: SearchParams): Promise<IProperty[]> => {
  try {
    // Build the query object
    const query: any = {};

    // Text search on title (case-insensitive)
    if (params.title) {
      query.title = { $regex: params.title, $options: "i" };
    }

    // Price range filter
    if (params.priceMin || params.priceMax) {
      query.price = {};
      if (params.priceMin) {
        query.price.$gte = params.priceMin;
      }
      if (params.priceMax) {
        query.price.$lte = params.priceMax;
      }
    }

    // Exact match for state
    if (params.state) {
      query.state = params.state;
    }

    // Exact match for city
    if (params.city) {
      query.city = params.city;
    }

    // Exact match for bedrooms
    if (params.bedrooms) {
      query.bedrooms = params.bedrooms;
    }

    // Exact match for bathrooms
    if (params.bathrooms) {
      query.bathrooms = params.bathrooms;
    }

    // Exact match for listingType
    if (params.listingType) {
      query.listingType = params.listingType;
    }

    // Execute the query
    const properties = await Property.find(query).populate(
      "createdBy",
      "email"
    );
    return properties;
  } catch (error: any) {
    throw new Error(`Failed to search properties: ${error.message}`);
  }
};

export default {
  create,
  getAll,
  getById,
  update,
  remove,
  search,
};
