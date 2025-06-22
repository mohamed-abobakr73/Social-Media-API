import mongoose from "mongoose";
import IReport from "./IReport";

type TPage = {
  pageName: string;
  createdBy: mongoose.Types.ObjectId;
  followers: mongoose.Types.ObjectId[];
  reports: IReport[];
  posts: mongoose.Types.ObjectId[];
  pageCover: string;
  banned: boolean;
  isDeleted: boolean;
  createdAt?: Date;
};

export default TPage;
