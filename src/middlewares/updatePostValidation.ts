import { body } from "express-validator";

const updatePostValidation = () => {
  return [
    body("postTitle")
      .optional()
      .isLength({ min: 4 })
      .withMessage("Post title must be at least 4 characters long")
      .isLength({ max: 20 })
      .withMessage("Post title must be at most 20 characters long"),
    body("postContent")
      .optional()
      .isLength({ min: 10 })
      .withMessage("Post content must be at least 10 characters long")
      .isLength({ max: 5000 })
      .withMessage("Post content must be at most 5000 characters long"),
  ];
};

export default updatePostValidation;
