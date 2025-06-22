import { Model, Document } from "mongoose";
import appError, { TAppError } from "./AppError";
import httpStatusText from "./httpStatusText";

const findDocumentOrError = async <T extends Document>(
  model: Model<T>,
  userId: string
): Promise<
  { type: "success"; data: T } | { type: "error"; error: TAppError }
> => {
  const user = await model.findById(userId).lean<T>(); // Ensures the result is a plain object
  if (!user) {
    return {
      type: "error",
      error: new AppError("Invalid user id", 400, httpStatusText.ERROR),
    };
  }
  return { type: "success", data: user };
};

export default findDocumentOrError;
