import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const EventSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    featuredImage: { type: String, default: "" },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    location: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    published: { type: Boolean, default: false },
  },
  { timestamps: true },
);

EventSchema.index({ published: 1, startDate: 1 });

export type EventDoc = InferSchemaType<typeof EventSchema>;

export const Event = (models.Event as Model<EventDoc>) ?? model<EventDoc>("Event", EventSchema);
