import mongoose from "mongoose";

interface IReport {
  reason: string;
  reportedBy: mongoose.Types.ObjectId;
  createdAt?: Date;
}

export default IReport;
