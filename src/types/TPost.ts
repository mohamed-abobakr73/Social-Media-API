import mongoose from "mongoose";
import TComment from "./TComment";
import IReport from "./IReport";

type TPost = {
  _id: mongoose.Types.ObjectId;
  postTitle?: string;
  postContent: string;
  images: string[];
  createdBy: mongoose.Types.ObjectId;
  createdAt?: Date;
  likes: mongoose.Types.ObjectId[];
  comments: TComment[];
  isShared: boolean;
  reports: IReport[];
  shares: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  banned: boolean;
};

export default TPost;
