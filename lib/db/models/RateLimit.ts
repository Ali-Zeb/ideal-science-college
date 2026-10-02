import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

/** Fixed-window counters used for rate limiting; MongoDB removes expired documents automatically. */
const RateLimitSchema = new Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
});

RateLimitSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type RateLimitDoc = InferSchemaType<typeof RateLimitSchema>;

export const RateLimit =
  (models.RateLimit as Model<RateLimitDoc>) ?? model<RateLimitDoc>("RateLimit", RateLimitSchema);
