import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";

const validateRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new AppError(
      "Validation Error",
      400,
      httpStatusText.ERROR,
      errors.array()
    );
    return next(error);
  }
  next();
};

export default validateRequestBody;
