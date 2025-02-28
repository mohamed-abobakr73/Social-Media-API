import { body } from "express-validator";

const joinGroupValidation = () => {
  return [
    body("userId").notEmpty().withMessage("User id is required"),
    body("notfications")
      .optional()
      .isBoolean()
      .withMessage("Notfications must be a boolean value [true, false]"),
  ];
};

export default joinGroupValidation;
