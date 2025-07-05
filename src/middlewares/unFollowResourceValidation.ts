import { query } from "express-validator";

const unFollowResourceValidation = () => {
  return [
    query("followType")
      .notEmpty()
      .withMessage("Resource type is required")
      .customSanitizer((value) => {
        if (typeof value === "string") {
          value.toLowerCase();
        }
        return value;
      })
      .isIn(["user", "group", "page"])
      .withMessage("Resource type value must be [user, page]"),
  ];
};

export default unFollowResourceValidation;
