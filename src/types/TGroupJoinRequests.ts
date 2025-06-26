import mongoose from "mongoose";

type TGroupJoinRequests = {
  group: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: "pending" | "accepted" | "declined";
  requestedAt: Date;
  respondedAt: Date;
  respondedBy: mongoose.Types.ObjectId;
};

export default TGroupJoinRequests;
