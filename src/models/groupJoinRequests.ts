import mongoose from "mongoose";
import { TGroupJoinRequests } from "../types";

const groupJoinRequestsSchema = new mongoose.Schema<TGroupJoinRequests>({
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "declined"],
    default: "pending",
  },
  requestedAt: { type: Date, default: Date.now },
  respondedAt: { type: Date },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export const GroupJoinRequests = mongoose.model(
  "GroupJoinRequests",
  groupJoinRequestsSchema
);
