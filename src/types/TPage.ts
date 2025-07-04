import mongoose from "mongoose";
import IReport from "./IReport";

type TPage = {
  pageName: string;
  createdBy: mongoose.Types.ObjectId;
  followersCount: number;
  reports: IReport[];
  posts: mongoose.Types.ObjectId[];
  pageCover: string;
  banned: boolean;
  isDeleted: boolean;
};

export default TPage;
