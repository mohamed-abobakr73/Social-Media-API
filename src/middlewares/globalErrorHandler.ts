import { NextFunction, Request, Response } from "express";
import TAppError from "../types/TAppError";
import httpStatusText from "../utils/httpStatusText";

const globalErrorHandler = (
  error: TAppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
};

export default globalErrorHandler;
