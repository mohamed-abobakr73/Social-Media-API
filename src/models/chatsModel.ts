import mongoose from "mongoose";
import { TChat } from "../types/";

const chatSchema = new mongoose.Schema<TChat>(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
  },
  {
    timestamps: true,
  }
);

export const Chat = mongoose.model<TChat>("Chat", chatSchema);
