import { body } from "express-validator";

const createPostValidation = () => {
  return [
    body("type")
      .notEmpty()
      .withMessage("Type is required")
      .customSanitizer((value) => {
        if (typeof value === "string") {
          value.toLowerCase();
        }
        return value;
        4;
      })
      .isIn(["user", "group", "page"])
      .withMessage("Type value must be [user, group, page]"),
    body("postTitle")
      .optional()
      .isLength({ min: 4 })
      .withMessage("Post title must be at least 4 characters long")
      .isLength({ max: 20 })
      .withMessage("Post title must be at most 20 characters long"),
    body("postContent")
      .notEmpty()
      .withMessage("Post content is required")
      .isLength({ min: 10 })
      .withMessage("Post content must be at least 10 characters long")
      .isLength({ max: 5000 })
      .withMessage("Post content must be at most 5000 characters long"),
    body("author")
      .notEmpty()
      .withMessage("Author is required")
      .isMongoId()
      .withMessage("Author ID must be a valid MongoDB ObjectId"),
    body("postOwnerId")
      .notEmpty()
      .withMessage("Post owner ID is required")
      .isMongoId()
      .withMessage("Post owner ID must be a valid MongoDB ObjectId"),
  ];
};

export default createPostValidation;
