import { body } from "express-validator";

const createAndUpdateUserValidation = (isUpdate: boolean) => {
  const requiredCheck = (field: string) =>
    isUpdate ? body(field).optional() : body(field);
  return [
    requiredCheck("username")
      .notEmpty()
      .withMessage("Username is required")
      .isLength({ min: 4 })
      .withMessage("Username must be at least 4 characters")
      .isLength({ max: 20 })
      .withMessage("Username can't be longer than 20 characters"),
    requiredCheck("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Please enter a valid email address"),
    ...(isUpdate
      ? [
          // Disallow password in update
          body("password").custom((value) => {
            if (value !== undefined) {
              throw new Error("Password cannot be updated via this route.");
            }
            return true;
          }),
        ]
      : [
          requiredCheck("password") // Normal password rules for create
            .notEmpty()
            .withMessage("Password is required")
            .isLength({ min: 8 })
            .withMessage("Password must be at least 8 characters long")
            .matches(/[A-Z]/)
            .withMessage("Password must contain at least one uppercase letter")
            .matches(/[a-z]/)
            .withMessage("Password must contain at least one lowercase letter")
            .matches(/\d/)
            .withMessage("Password must contain at least one number")
            .matches(/[\W_]/)
            .withMessage(
              "Password must contain at least one special character"
            ),
        ]),
    requiredCheck("age")
      .notEmpty()
      .withMessage("Age is required")
      .isNumeric()
      .withMessage("Age must be a number"),
    requiredCheck("gender")
      .notEmpty()
      .withMessage("Gender is required")
      .customSanitizer((value) => {
        if (typeof value === "string") {
          return value.toLowerCase();
        }
        return value;
      })
      .isIn(["male", "female"])
      .withMessage("Gender must be male or female"),
  ];
};

export default createAndUpdateUserValidation;
