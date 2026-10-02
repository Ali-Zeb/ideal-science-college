import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { PROGRAM_LEVELS } from "@/lib/constants";

const CurriculumSchema = new Schema(
  {
    semester: { type: Number, required: true, min: 1 },
    title: { type: String, default: "", trim: true },
    subjects: { type: [String], default: [] },
  },
  { _id: false },
);

const ProgramSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    level: { type: String, enum: PROGRAM_LEVELS, required: true },
    duration: { type: String, required: true, trim: true },
    shortDescription: { type: String, required: true, trim: true, maxlength: 220 },
    description: { type: String, required: true, trim: true },
    curriculum: { type: [CurriculumSchema], default: [] },
    fees: {
      admission: { type: Number, default: 0, min: 0 },
      monthly: { type: Number, default: 0, min: 0 },
      total: { type: Number, default: 0, min: 0 },
    },
    requirements: { type: [String], default: [] },
    careers: { type: [String], default: [] },
    seats: { type: Number, default: 0, min: 0 },
    wings: { type: String, enum: ["boys", "girls", "both"], default: "both" },
    faculty: [{ type: Schema.Types.ObjectId, ref: "Faculty" }],
    image: { type: String, default: "" },
    icon: { type: String, default: "FlaskConical" },
    order: { type: Number, default: 0 },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type ProgramDoc = InferSchemaType<typeof ProgramSchema>;

export const Program = (models.Program as Model<ProgramDoc>) ?? model<ProgramDoc>("Program", ProgramSchema);
