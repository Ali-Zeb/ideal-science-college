import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { STAFF_WINGS, USER_ROLES } from "@/lib/constants";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: USER_ROLES, default: "staff", required: true },
    /** Which admission records this account may see: girls-wing staff see only girls' applications. */
    wing: { type: String, enum: STAFF_WINGS, default: "all" },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof UserSchema>;

export const User = (models.User as Model<UserDoc>) ?? model<UserDoc>("User", UserSchema);
