import mongoose from "mongoose";

type TBlock = {
  user: mongoose.Types.ObjectId;
  blockedUser: mongoose.Types.ObjectId;
};

export default TBlock;
