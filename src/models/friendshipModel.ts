import mongoose from "mongoose";
import { TFriendship } from "../types";

const friendshipSchema = new mongoose.Schema<TFriendship>(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    friend: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const Friendship = mongoose.model("Friendship", friendshipSchema);
