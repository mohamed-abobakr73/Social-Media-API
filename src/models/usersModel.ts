import mongoose from "mongoose";
import { TUser } from "../types";

const usersSchema = new mongoose.Schema<TUser>(
  {
    username: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    gender: { type: String, required: true },
    profilePicture: {
      type: String,
      default: "https://example.com/default-profile-picture.png",
    },
    followersCount: { type: Number, default: 0 },
    banned: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "superAdmin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<TUser>("User", usersSchema);
