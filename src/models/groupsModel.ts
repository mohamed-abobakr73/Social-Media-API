import mongoose from "mongoose";
import { TGroup } from "../types/";

const groupsSchema = new mongoose.Schema<TGroup>(
  {
    groupName: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      immutable: true,
      required: true,
    },
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    admins: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    groupCover: { type: String },
    isPrivate: { type: Boolean, default: false },
    joinRequests: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      required: false,
      default: undefined,
    },
    reports: [
      {
        reason: { type: String },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    banned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, immutable: true, default: Date.now },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

groupsSchema.pre("save", function (next) {
  if (this.isPrivate && !this.joinRequests) {
    this.joinRequests = [];
  }
  next();
});

groupsSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate() as Partial<TGroup>;
  if (!update) {
    return;
  }
  if (update.isPrivate && !update.joinRequests) {
    this.setUpdate({ ...update, joinRequests: [] });
  }
  next();
});

groupsSchema.pre("save", function (next) {
  if (this.reports.length >= 10) this.banned = true;
  next();
});
export const Group = mongoose.model<TGroup>("Group", groupsSchema);
