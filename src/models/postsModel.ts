import mongoose from "mongoose";
import { TPost } from "../types/";

const postsSchema = new mongoose.Schema<TPost>(
  {
    postTitle: { type: String },
    postContent: { type: String, required: true },
    images: [{ type: String }],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    postOwnerType: {
      type: String,
      enum: ["user", "group", "page"],
      required: true,
    },
    postOwnerId: { type: mongoose.Schema.Types.ObjectId, required: true },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
    sharesCount: { type: Number, default: 0 },
    sharedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    originalPostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    reports: [
      {
        reason: { type: String },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

postsSchema.pre("save", function (next) {
  if (this.reports.length >= 10) this.banned = true;
  next();
});

export const Post = mongoose.model<TPost>("Post", postsSchema);
