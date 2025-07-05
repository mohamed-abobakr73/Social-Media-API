import { query } from "express-validator";

const followResourceValidation = () => {
  return [
    query("resourceType")
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
    query("resourceId")
      .notEmpty()
      .withMessage("Resource id is required")
      .isMongoId()
      .withMessage("Resource ID must be a valid MongoDB ObjectId"),
  ];
};

export default followResourceValidation;
