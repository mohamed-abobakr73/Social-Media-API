import AppError from "./AppError";
import httpStatusText from "./httpStatusText";

const assertUserIsAllowed = (
  resourceOwnerId: string,
  currentUserId: string,
  message: string = "You are not authorized to perform this action."
): void => {
  if (resourceOwnerId !== currentUserId) {
    const error = new AppError(message, 401, httpStatusText.FAIL);
    throw error;
  }
};

export default assertUserIsAllowed;
