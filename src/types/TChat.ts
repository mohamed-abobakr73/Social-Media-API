import mongoose from "mongoose";
import TMessage from "./TMessage";

type TChat = {
  participants: mongoose.Types.ObjectId[]; // Two users
  messages: TMessage[];
  createdAt?: Date;
  lastUpdated: Date;
};

export default TChat;
