import jwt from "jsonwebtoken";
import { configDotenv } from "dotenv";
import { TGenerateJwt } from "../types";

configDotenv();

const generateJwt = (payload: TGenerateJwt) => {
  const secretKey = process.env.JWT_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "JWT_SECRET_KEY is not defined in the environment variables."
    );
  }

  const token = jwt.sign(payload, secretKey, {
    expiresIn: "30m",
  });

  return token;
};

export default generateJwt;
