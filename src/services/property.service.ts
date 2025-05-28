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
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: "asc" | "desc";
}

interface PaginationParams {
  page?: number; // Page number (default: 1)
  limit?: number; // Items per page (default: 10)
  sortBy?: string; // Field to sort by (e.g., "price", "createdAt")
  order?: "asc" | "desc"; // Sort order (default: "asc")
}

interface PaginatedResponse {
  properties: IProperty[];
  total: number;
  page: number;
  totalPages: number;
  limit: number;
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
    const property = new Property({
      ...propertyData,
      createdBy: userId,
    });

    await property.save();

    // Invalidate caches
    await redis.del(CACHE_KEYS.ALL_PROPERTIES); // Invalidate getAll cache
    const searchKeys = await redis.keys("properties:search:*"); // Invalidate all search caches
    if (searchKeys.length > 0) await redis.del(searchKeys);
    console.log("Cache invalidated after create");

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
    // Check cache first
    const cachedData = await redis.get(CACHE_KEYS.ALL_PROPERTIES);
    if (cachedData) {
      console.log("Cache hit for getAll");
      return JSON.parse(cachedData);
    }

    // If not in cache, query MongoDB
    const properties = await Property.find().populate("createdBy", "email");

    // Cache the result
    await redis.setex(
      CACHE_KEYS.ALL_PROPERTIES,
      CACHE_TTL,
      JSON.stringify(properties)
    );
    console.log("Cache miss for getAll - data cached");

    return properties;
  } catch (error: any) {
    throw new Error(`Failed to fetch properties: ${error.message}`);
  }
};

// Get a property by ID
const getById = async (id: string): Promise<IProperty | null> => {
  try {
    // Check cache first
    const cacheKey = CACHE_KEYS.PROPERTY_BY_ID(id);
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for getById: ${id}`);
      return JSON.parse(cachedData);
    }

    // If not in cache, query MongoDB
    const property = await Property.findById(id).populate("createdBy", "email");
    if (!property) {
      throw new Error("Property not found");
    }

    // Cache the result
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(property));
    console.log(`Cache miss for getById: ${id} - data cached`);

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
    const property = await Property.findById(id);
    if (!property) {
      throw new Error("Property not found");
    }

    authMiddleware.checkOwnership(
      { userId, email: "" },
      property.createdBy.toString()
    );

    const updatedProperty = await Property.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    // Invalidate caches
    await redis.del(CACHE_KEYS.ALL_PROPERTIES); // Invalidate getAll cache
    await redis.del(CACHE_KEYS.PROPERTY_BY_ID(id)); // Invalidate getById cache
    const searchKeys = await redis.keys("properties:search:*"); // Invalidate all search caches
    if (searchKeys.length > 0) await redis.del(searchKeys);
    console.log("Cache invalidated after update");

    return updatedProperty;
  } catch (error: any) {
    throw new Error(`Failed to update property: ${error.message}`);
  }
};

// Delete a property (only by the creator)
const remove = async (id: string, userId: string): Promise<void> => {
  try {
    const property = await Property.findById(id);
    if (!property) {
      throw new Error("Property not found");
    }

    authMiddleware.checkOwnership(
      { userId, email: "" },
      property.createdBy.toString()
    );

    await Property.findByIdAndDelete(id);

    // Invalidate caches
    await redis.del(CACHE_KEYS.ALL_PROPERTIES); // Invalidate getAll cache
    await redis.del(CACHE_KEYS.PROPERTY_BY_ID(id)); // Invalidate getById cache
    const searchKeys = await redis.keys("properties:search:*"); // Invalidate all search caches
    if (searchKeys.length > 0) await redis.del(searchKeys);
    console.log("Cache invalidated after delete");
  } catch (error: any) {
    throw new Error(`Failed to delete property: ${error.message}`);
  }
};

const search = async (params: SearchParams): Promise<IProperty[]> => {
  try {
    // Generate a unique cache key based on search parameters
    const cacheKey = CACHE_KEYS.SEARCH(stringifySearchParams(params));

    // Check cache first
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Cache hit for search: ${cacheKey}`);
      return JSON.parse(cachedData);
    }

    // Build the query object
    const query: any = {};

    if (params.title) {
      query.title = { $regex: params.title, $options: "i" };
    }

    if (params.priceMin || params.priceMax) {
      query.price = {};
      if (params.priceMin) query.price.$gte = params.priceMin;
      if (params.priceMax) query.price.$lte = params.priceMax;
    }

    if (params.state) query.state = params.state;
    if (params.city) query.city = params.city;
    if (params.bedrooms) query.bedrooms = params.bedrooms;
    if (params.bathrooms) query.bathrooms = params.bathrooms;
    if (params.listingType) query.listingType = params.listingType;

    // Execute the query
    const properties = await Property.find(query).populate(
      "createdBy",
      "email"
    );

    // Cache the result
    await redis.setex(cacheKey, CACHE_TTL, JSON.stringify(properties));
    console.log(`Cache miss for search: ${cacheKey} - data cached`);

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
