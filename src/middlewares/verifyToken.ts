import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import dotenv from "dotenv";
import { TCurrentUser } from "../types/";

dotenv.config();

const extractTokenFromHeaders = (req: Request) => {
  const authHeaders =
    req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeaders || typeof authHeaders !== "string") {
    const error = new AppError(
      "No token provided or invalid header format",
      401,
      httpStatusText.ERROR
    );
    throw error;
  }

  const token = authHeaders.split(" ")[1];
  if (!token) {
    const error = new AppError(
      "No token found in the headers",
      401,
      httpStatusText.ERROR
    );
    throw error;
  }

  return token;
};

const verifyToken = (
  req: Request & { currentUser?: TCurrentUser },
  res: Response,
  next: NextFunction
) => {
  try {
    const token = extractTokenFromHeaders(req);

    const currentUser = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as JwtPayload & TCurrentUser;

    req.currentUser = currentUser;
    next();
  } catch (error) {
    const err = new AppError("Invalid JWT token", 401, httpStatusText.ERROR);
    return next(err);
  }
};

export default verifyToken;
