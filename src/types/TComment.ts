import mongoose from "mongoose";

type TComment = {
  _id?: mongoose.Types.ObjectId;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
};

export default TComment;
