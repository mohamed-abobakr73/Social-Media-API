import mongoose from "mongoose";
import { TBlock } from "../types";

const blockSchema = new mongoose.Schema<TBlock>({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  blockedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

export const Block = mongoose.model("Block", blockSchema);
