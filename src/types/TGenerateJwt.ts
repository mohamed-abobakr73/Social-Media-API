import mongoose from "mongoose";

type TGenerateJwt = {
  id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  role: "user" | "superAdmin";
};

export default TGenerateJwt;
