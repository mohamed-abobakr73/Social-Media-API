import { body } from "express-validator";

const createOrUpdateCommentValidation = () => {
  return [
    body("content")
      .notEmpty()
      .withMessage("Content is required")
      .isLength({ min: 1 })
      .withMessage("Content must be at least 1 character long")
      .isLength({ max: 5000 })
      .withMessage("Content must be at most 5000 characters long"),
  ];
};

export default createOrUpdateCommentValidation;
