import AppError from "./AppError";
import httpStatusText from "./httpStatusText";

function doesResourceExists<T>(
  resource: T,
  message: string
): asserts resource is NonNullable<T> {
  if (!resource) {
    throw new AppError(message, 404, httpStatusText.NOT_FOUND);
  }
}

export default doesResourceExists;
