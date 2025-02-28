import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectToDb = async () => {
  const url = process.env.DB_SECRET_KEY;
  if (!url) {
    throw new Error("No database url provided");
  }
  await mongoose.connect(url);
  console.log("db connected");
};

export default connectToDb;
