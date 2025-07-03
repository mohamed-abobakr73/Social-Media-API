import mongoose from "mongoose";

type TComment = {
  post: mongoose.Types.ObjectId;
  content: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
};

export default TComment;
