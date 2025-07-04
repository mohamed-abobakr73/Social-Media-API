import { body } from "express-validator";

const createPageValidation = () => {
  return [
    body("pageName")
      .notEmpty()
      .withMessage("Page name is required")
      .isLength({ min: 4 })
      .withMessage("Page name must be at least 4 characters long")
      .isLength({ max: 20 })
      .withMessage("Page name must be at most 20 characters long"),
  ];
};

export default createPageValidation;
