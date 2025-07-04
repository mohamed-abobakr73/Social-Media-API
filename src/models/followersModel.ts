import mongoose from "mongoose";
import { TFollowers } from "../types";

const followersSchema = new mongoose.Schema<TFollowers>({
  follower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  following: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

export const Follower = mongoose.model("Follower", followersSchema);
