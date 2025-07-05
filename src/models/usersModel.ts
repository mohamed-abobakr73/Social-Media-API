import mongoose from "mongoose";
import { IReport } from "../types/";

// Define the type for the reports

export interface IMadeReports {
  reportedItemId: mongoose.Types.ObjectId;
  reason: string;
  createdAt?: Date;
}

// Define the type for the notifications
export interface INotification {
  _id?: { type: mongoose.Schema.Types.ObjectId };
  message: string;
  read?: boolean;
  createdAt?: Date;
}

// Define the type for the user's groups
export interface IUserGroup {
  groupId: mongoose.Types.ObjectId;
  notifications: boolean;
}

// Define the base User type extending the Mongoose Document
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  username: string;
  age: number;
  email: string;
  password: string;
  gender: string;
  profilePicture: string;
  followersCount: number;
  chats: mongoose.Types.ObjectId[];
  notifications: INotification[];
  createdAt?: Date;
  updatedAt: Date;
  banned: boolean;
  role: "user" | "superAdmin";
  token: string;
}

const usersSchema = new mongoose.Schema<IUser>(
  {
    username: { type: String, required: true },
    age: { type: Number, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    gender: { type: String, required: true },
    profilePicture: {
      type: String,
      default: "https://example.com/default-profile-picture.png",
    },
    followersCount: { type: Number, default: 0 },
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
    createdAt: { type: Date, immutable: true, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    banned: { type: Boolean, default: false },
    role: { type: String, enum: ["user", "superAdmin"], default: "user" },
  },
  {
    timestamps: true,
  }
);

export const User = mongoose.model<IUser>("User", usersSchema);
