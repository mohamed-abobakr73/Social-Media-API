import mongoose from "mongoose";
import { TComment } from "../types";

const commentsSchema = new mongoose.Schema<TComment>({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  },
  content: { type: String, required: true },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: { type: Date, default: Date.now, immutable: true },
});

export const Comment = mongoose.model("Comment", commentsSchema);
