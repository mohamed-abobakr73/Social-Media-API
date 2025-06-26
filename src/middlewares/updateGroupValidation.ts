import { body } from "express-validator";

const updateGroupValidation = () => {
  return [
    body("groupName")
      .optional()
      .isLength({ min: 4 })
      .withMessage("Group name must be at least 4 characters long")
      .isLength({ max: 20 })
      .withMessage("Group name must be at most 20 characters long"),
    body("isPrivate")
      .optional()
      .isBoolean()
      .withMessage("Is private must be a boolean value"),
  ];
};

export default updateGroupValidation;
