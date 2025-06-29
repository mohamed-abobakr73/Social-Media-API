import AppError from "./AppError";
import httpStatusText from "./httpStatusText";

function doesResourceExists<T>(
  resource: T,
  message: string,
  status: number = 404,
  statusText: string = httpStatusText.NOT_FOUND
): asserts resource is NonNullable<T> {
  if (!resource) {
    throw new AppError(message, status, statusText);
  }
}

export default doesResourceExists;
