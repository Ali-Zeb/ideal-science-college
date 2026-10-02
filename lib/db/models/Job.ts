import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const JOB_TYPES = ["full-time", "part-time", "visiting"] as const;
export const JOB_APPLICATION_STATUSES = ["new", "shortlisted", "rejected", "hired"] as const;

const JobSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, trim: true },
    type: { type: String, enum: JOB_TYPES, default: "full-time" },
    location: { type: String, default: "Serai Naurang Campus", trim: true },
    description: { type: String, required: true, trim: true },
    requirements: { type: [String], default: [] },
    responsibilities: { type: [String], default: [] },
    salaryRange: { type: String, default: "", trim: true },
    deadline: { type: Date, required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const JobApplicationSchema = new Schema(
  {
    job: { type: Schema.Types.ObjectId, ref: "Job", required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    experience: { type: String, required: true, trim: true },
    coverLetter: { type: String, default: "", trim: true },
    resume: { type: String, required: true },
    status: { type: String, enum: JOB_APPLICATION_STATUSES, default: "new" },
  },
  { timestamps: true },
);

export type JobDoc = InferSchemaType<typeof JobSchema>;
export type JobApplicationDoc = InferSchemaType<typeof JobApplicationSchema>;

export const Job = (models.Job as Model<JobDoc>) ?? model<JobDoc>("Job", JobSchema);

export const JobApplication =
  (models.JobApplication as Model<JobApplicationDoc>) ??
  model<JobApplicationDoc>("JobApplication", JobApplicationSchema);
