import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sentTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "declined", "pending"],
      default: "pending",
    },
    uniqueRequest: {
      type: String,
      unique: true,
      select: false,
    },
  },
  { timestamps: true }
);

friendRequestSchema.index({ sender: 1, sentTo: 1 }, { unique: true });

friendRequestSchema.pre("save", async function (next) {
  const ids = [this.sender.toString(), this.sentTo.toString()].sort();
  this.uniqueRequest = `${ids[0]}-${ids[1]}`;
  next();
});

export const FriendRequest = mongoose.model(
  "FriendRequest",
  friendRequestSchema
);
