import httpStatusText from "./httpStatusText";
import TAppError from "../types/TAppError";
import { ValidationError } from "express-validator";

class AppError extends Error implements TAppError {
  public message: string;
  public statusCode: number;
  public statusText: string;
  public validationErrors?: ValidationError[];

  constructor(
    message: string,
    statusCode: number,
    statusText: string,
    validationErrors?: ValidationError[]
  ) {
    super();
    this.message = message || "Something went wrong";
    this.statusCode = statusCode || 500;
    this.statusText = statusText || httpStatusText.ERROR;
    this.validationErrors = validationErrors;
    return this;
  }
}

export default AppError;
