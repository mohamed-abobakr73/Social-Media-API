import mongoose from "mongoose";

type TFriendship = {
  user: mongoose.Types.ObjectId;
  friend: mongoose.Types.ObjectId;
};

export default TFriendship;
