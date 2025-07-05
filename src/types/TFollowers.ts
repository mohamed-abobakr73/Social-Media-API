import mongoose from "mongoose";

type TFollowers = {
  follower: mongoose.Types.ObjectId;
  following: mongoose.Types.ObjectId;
};

export default TFollowers;
