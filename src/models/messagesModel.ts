import mongoose from "mongoose";
import { TMessage } from "../types";

const messagesSchema = new mongoose.Schema<TMessage>(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    seen: { type: Boolean },
  },
  {
    timestamps: true,
  }
);

export const Message = mongoose.model<TMessage>("Message", messagesSchema);
