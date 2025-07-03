import { query } from "express-validator";

const getAllPostsValidation = () => {
  return [
    query("type")
      .notEmpty()
      .withMessage("Type is required")
      .customSanitizer((value) => {
        if (typeof value === "string") {
          value.toLowerCase();
        }
        return value;
      })
      .isIn(["user", "group", "page"])
      .withMessage("Type value must be [user, group, page]"),
    query("postsSourceId")
      .notEmpty()
      .withMessage("Posts source id is required")
      .isMongoId()
      .withMessage("Posts source ID must be a valid MongoDB ObjectId"),
  ];
};

export default getAllPostsValidation;
