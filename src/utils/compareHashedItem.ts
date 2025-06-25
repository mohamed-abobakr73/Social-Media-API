import bcrypt from "bcrypt";
import httpStatusText from "./httpStatusText";
import AppError from "./AppError";
const compareHashedItem = (
  item: string,
  hashedItem: string,
  message: string
) => {
  const comparisonResult = bcrypt.compareSync(item, hashedItem);
  if (!comparisonResult) {
    const error = new AppError(message, 400, httpStatusText.ERROR);
    throw error;
  }
};

export default compareHashedItem;
