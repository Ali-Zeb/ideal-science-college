import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Singleton document (key = "site") holding admin-editable site configuration. */
const SettingsSchema = new Schema(
  {
    key: { type: String, default: "site", unique: true },
    siteName: { type: String, default: "" },
    tagline: { type: String, default: "" },
    logo: { type: String, default: "" },
    contact: {
      phone: { type: String, default: "" },
      email: { type: String, default: "" },
      address: { type: String, default: "" },
      officeHours: { type: String, default: "" },
      mapEmbedUrl: { type: String, default: "" },
    },
    social: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      youtube: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords: { type: [String], default: [] },
    },
    admissionsOpen: { type: Boolean, default: true },
    announcement: { type: String, default: "" },
  },
  { timestamps: true },
);

export type SettingsDoc = InferSchemaType<typeof SettingsSchema>;

export const Settings = (models.Settings as Model<SettingsDoc>) ?? model<SettingsDoc>("Settings", SettingsSchema);
