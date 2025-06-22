import { ValidationError } from "express-validator";

type TAppError = {
  message: string;
  statusCode: number;
  statusText: string;
  validationErrors?: ValidationError[];
};

export default TAppError;
