import mongoose from "mongoose";
import { TPost } from "../types/";

const postsSchema = new mongoose.Schema<TPost>(
  {
    postTitle: { type: String },
    postContent: { type: String, required: true },
    images: [{ type: String }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    createdAt: { type: Date, immutable: true, default: Date.now },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
      {
        content: { type: String, required: true },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        createdAt: { type: Date, default: Date.now, immutable: true },
      },
    ],
    shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [
      {
        reason: { type: String },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    banned: { type: Boolean, defaut: false },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

postsSchema.pre("save", function (next) {
  if (this.reports.length >= 10) this.banned = true;
  next();
});

export const Post = mongoose.model<TPost>("Post", postsSchema);
