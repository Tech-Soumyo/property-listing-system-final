import { Request, Response } from "express";
import propertyService from "../services/property.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

// Create a new property
const create = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const propertyData = req.body;
    const property = await propertyService.create(propertyData, userId);
    res
      .status(201)
      .json({ message: "Property created successfully", property });
    return;
  } catch (error: any) {
    res.status(400).json({ message: error.message });
    return;
  }
};

// Get all properties
const getAll = async (req: Request, res: Response) => {
  try {
    const properties = await propertyService.getAll();
    res.status(200).json({ properties });
    return;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
    return;
  }
};

// Get a property by ID
const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const property = await propertyService.getById(id);
    res.status(200).json({ property });
    return;
  } catch (error: any) {
    res.status(404).json({ message: error.message });
    return;
  }
};

// Update a property
const update = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { id } = req.params;
    const updateData = req.body;
    const updatedProperty = await propertyService.update(
      id,
      userId,
      updateData
    );
    res.status(200).json({
      message: "Property updated successfully",
      property: updatedProperty,
    });
    return;
  } catch (error: any) {
    res.status(403).json({ message: error.message });
    return;
  }
};

// Delete a property
const remove = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const { id } = req.params;
    await propertyService.remove(id, userId);
    res.status(200).json({ message: "Property deleted successfully" });
    return;
  } catch (error: any) {
    res.status(403).json({ message: error.message });
    return;
  }
};

const search = async (req: Request, res: Response) => {
  try {
    const {
      title,
      priceMin,
      priceMax,
      state,
      city,
      bedrooms,
      bathrooms,
      listingType,
    } = req.query;

    const searchParams: any = {};

    if (title) searchParams.title = String(title);

    if (priceMin) {
      const min = Number(priceMin);
      if (isNaN(min)) throw new Error("priceMin must be a valid number");
      searchParams.priceMin = min;
    }

    if (priceMax) {
      const max = Number(priceMax);
      if (isNaN(max)) throw new Error("priceMax must be a valid number");
      searchParams.priceMax = max;
    }

    if (state) searchParams.state = String(state);
    if (city) searchParams.city = String(city);

    if (bedrooms) {
      const beds = Number(bedrooms);
      if (isNaN(beds)) throw new Error("bedrooms must be a valid number");
      searchParams.bedrooms = beds;
    }

    if (bathrooms) {
      const baths = Number(bathrooms);
      if (isNaN(baths)) throw new Error("bathrooms must be a valid number");
      searchParams.bathrooms = baths;
    }

    if (listingType) {
      if (!["rent", "sale"].includes(String(listingType))) {
        throw new Error('listingType must be "rent" or "sale"');
      }
      searchParams.listingType = String(listingType) as "rent" | "sale";
    }

    const properties = await propertyService.search(searchParams);
    res.status(200).json({ properties });
    return;
  } catch (error: any) {
    res.status(400).json({ message: error.message });
    return;
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
