import mongoose from "mongoose";

type TFriendRequest = {
  sender: mongoose.Types.ObjectId;
  status: "accepted" | "declined" | "pending"; // Enum for status
};

export default TFriendRequest;
