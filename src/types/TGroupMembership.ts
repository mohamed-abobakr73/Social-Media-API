import mongoose from "mongoose";

type TGroupMembership = {
  group: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  role: string;
  joinedAt: Date;
};

export default TGroupMembership;
