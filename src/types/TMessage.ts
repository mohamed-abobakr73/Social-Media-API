import mongoose from "mongoose";

type TMessage = {
  chat: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  seen: boolean;
};

export default TMessage;
