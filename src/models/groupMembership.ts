import mongoose from "mongoose";
import { TGroupMembership } from "../types";

const groupMembershipSchema = new mongoose.Schema<TGroupMembership>({
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
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    immutable: true,
    default: Date.now,
  },
});

export const GroupMembership = mongoose.model(
  "GroupMembership",
  groupMembershipSchema
);
