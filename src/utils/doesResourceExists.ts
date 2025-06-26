import AppError from "./AppError";
import httpStatusText from "./httpStatusText";

function doesResourceExists<T>(
  resource: T,
  message: string,
  status: number = 404
): asserts resource is NonNullable<T> {
  if (!resource) {
    throw new AppError(message, status, httpStatusText.NOT_FOUND);
  }
}

export default doesResourceExists;
