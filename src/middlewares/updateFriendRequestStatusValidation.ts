import { body } from "express-validator";

const updateFriendRequestStatusValidation = () => {
  return [
    body("status")
      .notEmpty()
      .withMessage("Status is required")
      .customSanitizer((value) => {
        if (typeof value === "string") {
          return value.toLowerCase();
        }
        return value;
      })
      .isIn(["accepted", "declined"])
      .withMessage("Status must be accepted or declined"),
  ];
};

export default updateFriendRequestStatusValidation;
