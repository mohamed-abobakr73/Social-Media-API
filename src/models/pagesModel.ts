import mongoose from "mongoose";
import { TPage } from "../types/";

const pagesSchema = new mongoose.Schema<TPage>(
  {
    pageName: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    reports: [
      {
        reason: { type: String },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
    pageCover: { type: String },
    banned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    createdAt: { type: Date, immutable: true, default: Date.now },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

pagesSchema.pre("save", function (next) {
  if (this.reports.length >= 10) this.banned = true;
  next();
});

export const Page = mongoose.model<TPage>("Page", pagesSchema);
