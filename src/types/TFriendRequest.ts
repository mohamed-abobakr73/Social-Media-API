import mongoose from "mongoose";
import { TFriendRequestStatus } from "../types";

type TFriendRequest = {
  sender: mongoose.Types.ObjectId;
  sentTo: mongoose.Types.ObjectId;
  status: TFriendRequestStatus;
  uniqueRequest: string;
};

export default TFriendRequest;
