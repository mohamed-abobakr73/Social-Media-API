import { body } from "express-validator";

const createGroupValidation = () => {
  return [
    body("groupName")
      .notEmpty()
      .withMessage("Group name is required")
      .isLength({ min: 4 })
      .withMessage("Group name must be at least 4 characters long")
      .isLength({ max: 20 })
      .withMessage("Group name must be at most 20 characters long"),
    body("isPrivate")
      .isBoolean()
      .withMessage("Is private must be a boolean value"),
  ];
};

export default createGroupValidation;
