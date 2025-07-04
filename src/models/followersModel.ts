import mongoose from "mongoose";

const followersSchema = new mongoose.Schema({
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
