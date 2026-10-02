import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const NewsSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, required: true, trim: true, maxlength: 300 },
    content: { type: String, required: true },
    featuredImage: { type: String, default: "" },
    category: { type: String, required: true, trim: true },
    tags: { type: [String], default: [] },
    author: { type: Schema.Types.ObjectId, ref: "User" },
    published: { type: Boolean, default: false },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);

NewsSchema.index({ published: 1, publishedAt: -1 });

export type NewsDoc = InferSchemaType<typeof NewsSchema>;

export const News = (models.News as Model<NewsDoc>) ?? model<NewsDoc>("News", NewsSchema);
