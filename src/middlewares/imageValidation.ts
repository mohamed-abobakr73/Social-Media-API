import { Request, Response, NextFunction } from "express";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";

const imageValidation = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    const error = new AppError("No file uploaded", 400, httpStatusText.ERROR);
    return next(error);
  }
  next();
};

export default imageValidation;
