import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const GalleryImageSchema = new Schema({
  url: { type: String, required: true },
  caption: { type: String, default: "", trim: true },
  order: { type: Number, default: 0 },
});

const GallerySchema = new Schema(
  {
    albumName: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    coverImage: { type: String, default: "" },
    images: { type: [GalleryImageSchema], default: [] },
    category: { type: String, required: true, trim: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type GalleryDoc = InferSchemaType<typeof GallerySchema>;

export const Gallery = (models.Gallery as Model<GalleryDoc>) ?? model<GalleryDoc>("Gallery", GallerySchema);
