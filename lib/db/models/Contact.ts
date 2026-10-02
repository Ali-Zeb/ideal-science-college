import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const ContactSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, default: "", trim: true },
    subject: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead: { type: Boolean, default: false },
    repliedAt: { type: Date },
    replyNote: { type: String, default: "" },
  },
  { timestamps: true },
);

ContactSchema.index({ isRead: 1, createdAt: -1 });

export type ContactDoc = InferSchemaType<typeof ContactSchema>;

export const Contact = (models.Contact as Model<ContactDoc>) ?? model<ContactDoc>("Contact", ContactSchema);
