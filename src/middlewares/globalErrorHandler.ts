import { NextFunction, Request, Response } from "express";
import TGlobalError from "../types/globalErrorType";
import httpStatusText from "../utils/httpStatusText";

const globalErrorHandler = (
  error: TGlobalError,
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
