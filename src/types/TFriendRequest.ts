import mongoose from "mongoose";
import { TStatus } from "../types";

type TFriendRequest = {
  sender: mongoose.Types.ObjectId;
  sentTo: mongoose.Types.ObjectId;
  status: TStatus;
  uniqueRequest: string;
};

export default TFriendRequest;
