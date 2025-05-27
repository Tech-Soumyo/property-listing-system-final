import { Schema, model, Document, Types } from "mongoose";

// Interface for TypeScript type safety
export interface IProperty extends Document {
  externalId: string;
  title: string;
  type: string;
  price: number;
  state: string;
  city: string;
  areaSqFt: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  furnished: "Unfurnished" | "Furnished" | "Semi";
  availableFrom: Date;
  listedBy: "Builder" | "Owner" | "Agent";
  tags: string[];
  colorTheme: string;
  rating: number;
  isVerified: boolean;
  listingType: "rent" | "sale";
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const propertySchema = new Schema<IProperty>(
  {
    externalId: {
      type: String,
      required: [true, "External ID is required"],
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    type: {
      type: String,
      required: [true, "Type is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    areaSqFt: {
      type: Number,
      required: [true, "Area in square feet is required"],
      min: [0, "Area cannot be negative"],
    },
    bedrooms: {
      type: Number,
      required: [true, "Number of bedrooms is required"],
      min: [0, "Bedrooms cannot be negative"],
    },
    bathrooms: {
      type: Number,
      required: [true, "Number of bathrooms is required"],
      min: [0, "Bathrooms cannot be negative"],
    },
    amenities: {
      type: [String],
      default: [],
    },
    furnished: {
      type: String,
      enum: ["Unfurnished", "Furnished", "Semi"],
      required: [true, "Furnished status is required"],
    },
    availableFrom: {
      type: Date,
      required: [true, "Available from date is required"],
    },
    listedBy: {
      type: String,
      enum: ["Builder", "Owner", "Agent"],
      required: [true, "ListedBy is required"],
    },
    tags: {
      type: [String],
      default: [],
    },
    colorTheme: {
      type: String,
      required: [true, "Color theme is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 0,
      max: 5,
    },
    isVerified: {
      type: Boolean,
      required: [true, "Verification status is required"],
    },
    listingType: {
      type: String,
      enum: ["rent", "sale"],
      required: [true, "Listing type is required"],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for frequently queried fields
propertySchema.index({ price: 1 });
propertySchema.index({ state: 1 });
propertySchema.index({ city: 1 });
propertySchema.index({ bedrooms: 1 });
propertySchema.index({ bathrooms: 1 });

// Create and export the model
const Property = model<IProperty>("Property", propertySchema);

export default Property;
