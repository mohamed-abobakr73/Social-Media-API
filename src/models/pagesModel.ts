import mongoose, { Query } from "mongoose";
import { TPage } from "../types/";

const pagesSchema = new mongoose.Schema<TPage>(
  {
    pageName: { type: String, required: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    followersCount: { type: Number, default: 0 },
    reports: [
      {
        reason: { type: String },
        reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    pageCover: { type: String },
    banned: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

pagesSchema.pre("save", function (next) {
  if (this.reports.length >= 10) this.banned = true;
  next();
});

pagesSchema.pre(/^find/, function (this: Query<any, any>, next) {
  this.where({ isDeleted: false });
  next();
});

export const Page = mongoose.model<TPage>("Page", pagesSchema);
