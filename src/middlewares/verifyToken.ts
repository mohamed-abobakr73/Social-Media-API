import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import dotenv from "dotenv";
import { TCurrentUser } from "../types/TCurrentUser";

dotenv.config();

const verifyToken = (
  req: Request & { currentUser?: TCurrentUser },
  res: Response,
  next: NextFunction
) => {
  const authHeaders =
    req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeaders || typeof authHeaders !== "string") {
    const error = new AppError(
      "No token provided or invalid header format",
      401,
      httpStatusText.ERROR
    );
    return next(error);
  }
  const token = authHeaders.split(" ")[1];

  if (!token) {
    const error = new AppError(
      "No token found in the header",
      401,
      httpStatusText.ERROR
    );
    return next(error);
  }
  try {
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
