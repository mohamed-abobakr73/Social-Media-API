import { NextFunction, Request, Response } from "express";
import TAppError from "../types/TAppError";
import httpStatusText from "../utils/httpStatusText";

const globalErrorHandler = (
  error: TAppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const errorJsonObject: {
    status: string;
    message: string;
    code: number;
    data: any;
    validationErrors?: any;
  } = {
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  };
  if (error.validationErrors) {
    errorJsonObject.validationErrors = error.validationErrors;
  }
  res.status(error.statusCode || 500).json(errorJsonObject);
};

export default globalErrorHandler;
