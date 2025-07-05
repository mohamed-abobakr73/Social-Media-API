import mongoose from "mongoose";

type TUser = {
  _id: mongoose.Types.ObjectId;
  username: string;
  age: number;
  email: string;
  password: string;
  gender: string;
  profilePicture: string;
  followersCount: number;
  banned: boolean;
  role: "user" | "superAdmin";
  token: string;
};

export default TUser;
