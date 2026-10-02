import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const FacultySchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    designation: { type: String, required: true, trim: true },
    department: { type: String, required: true, trim: true },
    wing: { type: String, enum: ["boys", "girls", "both"], default: "both" },
    qualification: { type: String, required: true, trim: true },
    experience: { type: String, default: "", trim: true },
    bio: { type: String, default: "", trim: true },
    photo: { type: String, default: "" },
    email: { type: String, default: "", lowercase: true, trim: true },
    social: {
      linkedin: { type: String, default: "" },
      twitter: { type: String, default: "" },
      facebook: { type: String, default: "" },
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

FacultySchema.index({ isActive: 1, order: 1 });

export type FacultyDoc = InferSchemaType<typeof FacultySchema>;

export const Faculty = (models.Faculty as Model<FacultyDoc>) ?? model<FacultyDoc>("Faculty", FacultySchema);
