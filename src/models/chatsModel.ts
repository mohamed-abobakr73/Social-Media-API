import mongoose from "mongoose";
import { TChat, TMessage } from "../types/";

const chatSchema = new mongoose.Schema<TChat>(
  {
    participants: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ],
    messages: [
      {
        sender: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        content: { type: String, required: true },
        createdAt: { type: Date, immutable: true, default: Date.now },
      },
    ],
    lastUpdated: { type: Date, default: Date.now },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

export const Chat = mongoose.model<TChat>("Chat", chatSchema);
