import mongoose from "mongoose";
import TMessage from "./TMessage";

type TChat = {
  participants: mongoose.Types.ObjectId[]; // Two users
};

export default TChat;
