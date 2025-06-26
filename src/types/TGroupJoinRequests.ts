import mongoose from "mongoose";
import TStatus from "./TStatus";

type TGroupJoinRequests = {
  group: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: TStatus;
  requestedAt: Date;
  respondedAt: Date;
  respondedBy: mongoose.Types.ObjectId;
};

export default TGroupJoinRequests;
