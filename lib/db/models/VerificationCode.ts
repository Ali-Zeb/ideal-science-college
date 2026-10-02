import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

export const CODE_PURPOSES = ["verify-email", "reset-password"] as const;

/** One-time 6-digit codes (stored hashed) for email verification and password reset. */
const VerificationCodeSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    accountKind: { type: String, enum: ["staff", "student"], required: true },
    purpose: { type: String, enum: CODE_PURPOSES, required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

VerificationCodeSchema.index({ email: 1, accountKind: 1, purpose: 1 }, { unique: true });
VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type VerificationCodeDoc = InferSchemaType<typeof VerificationCodeSchema>;

export const VerificationCode =
  (models.VerificationCode as Model<VerificationCodeDoc>) ??
  model<VerificationCodeDoc>("VerificationCode", VerificationCodeSchema);
