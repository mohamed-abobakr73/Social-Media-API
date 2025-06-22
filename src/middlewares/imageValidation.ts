import { Request, Response, NextFunction } from "express";
import appError from "../utils/appError.js";
import httpStatusText from "../utils/httpStatusText.js";

const imageValidation = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    const error = appError.create(
      "No file uploaded",
      400,
      httpStatusText.ERROR
    );
    return next(error);
  }
  next();
};

export default imageValidation;
