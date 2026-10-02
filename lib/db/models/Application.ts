import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { APPLICATION_STATUSES } from "@/lib/constants";

const ApplicationSchema = new Schema(
  {
    applicationNumber: { type: String, required: true, unique: true },
    student: {
      fullName: { type: String, required: true, trim: true },
      fatherName: { type: String, required: true, trim: true },
      cnic: { type: String, required: true, trim: true },
      dateOfBirth: { type: Date, required: true },
      gender: { type: String, enum: ["male", "female"], required: true },
      phone: { type: String, required: true, trim: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      address: { type: String, required: true, trim: true },
    },
    academic: {
      lastClass: { type: String, required: true, trim: true },
      previousSchool: { type: String, default: "", trim: true },
      board: { type: String, default: "", trim: true },
      passingYear: { type: Number, default: null },
      previousGrade: { type: String, default: "", trim: true },
      marksObtained: { type: Number, default: null, min: 0 },
      totalMarks: { type: Number, default: null, min: 1 },
      percentage: { type: Number, default: null, min: 0, max: 100 },
    },
    wing: { type: String, enum: ["boys", "girls"], required: true },
    program: { type: Schema.Types.ObjectId, ref: "Program", required: true },
    account: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    documents: {
      cnic: { type: String, default: "" },
      marksheet: { type: String, default: "" },
      photo: { type: String, default: "" },
    },
    status: { type: String, enum: APPLICATION_STATUSES, default: "pending" },
    reviewNote: { type: String, default: "" },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
  },
  { timestamps: true },
);

ApplicationSchema.index({ status: 1, createdAt: -1 });

export type ApplicationDoc = InferSchemaType<typeof ApplicationSchema>;

export const Application =
  (models.Application as Model<ApplicationDoc>) ?? model<ApplicationDoc>("Application", ApplicationSchema);
