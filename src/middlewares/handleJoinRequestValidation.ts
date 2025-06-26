import { body } from "express-validator";

const handleJoinRequestValidation = () => {
  return [
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .customSanitizer((value) => {
        if (typeof value === "string") {
          value.toLowerCase();
        }
        return value;
      })
      .isIn(["accepted", "declined"])
      .withMessage("Status value must be [accepted, declined]"),
  ];
};

export default handleJoinRequestValidation;
