import mongoose from "mongoose";
import IReport from "./IReport";

type TGroup = {
  groupName: string;
  createdBy: mongoose.Types.ObjectId;
  groupMembers: mongoose.Types.ObjectId[];
  posts: mongoose.Types.ObjectId[];
  admins: mongoose.Types.ObjectId[];
  groupCover: string;
  isPrivate: boolean;
  joinRequests: mongoose.Types.ObjectId[];
  reports: IReport[];
  banned: boolean;
  isDeleted: boolean;
  createdAt?: Date;
};

export default TGroup;
