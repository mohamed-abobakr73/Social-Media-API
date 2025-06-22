import mongoose from "mongoose";

type TMessage = {
  _id?: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  content: string;
  seen: boolean;
  createdAt?: Date;
};

export default TMessage;
