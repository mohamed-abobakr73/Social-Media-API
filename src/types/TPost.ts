import mongoose from "mongoose";
import IReport from "./IReport";
import TPostType from "./TPostType";

type TPost = {
  _id: mongoose.Types.ObjectId;
  postTitle?: string;
  postContent: string;
  images: string[];
  author: mongoose.Types.ObjectId;
  postOwnerType: TPostType;
  postOwnerId: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  likesCount: number;
  sharesCount: number;
  sharedBy?: mongoose.Types.ObjectId;
  originalPostId: mongoose.Types.ObjectId;
  reports: IReport[];
  shares: mongoose.Types.ObjectId[];
  isDeleted: boolean;
  banned: boolean;
};

export default TPost;
