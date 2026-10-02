import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Student / applicant accounts used by the student portal (separate from staff users). */
const StudentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, select: false },
    emailVerified: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

export type StudentDoc = InferSchemaType<typeof StudentSchema>;

export const Student = (models.Student as Model<StudentDoc>) ?? model<StudentDoc>("Student", StudentSchema);
