import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  login,
  updateUser,
  deleteUser,
} from "../controllers/usersController";
import { upload } from "../config/";
import {
  createAndUpdateUserValidation,
  loginValidation,
  verifyToken,
  validateRequestBody,
} from "../middlewares/";

const usersRouter = Router();

// Get all users
usersRouter.route("/").get(getAllUsers);

// Get a user by ID
usersRouter.route("/:userId").get(getUserById);

// Create user
usersRouter
  .route("/")
  .post(
    upload.single("profilePicture"),
    createAndUpdateUserValidation(false),
    validateRequestBody,
    createUser
  );

// Login
usersRouter.route("/login").post(loginValidation(), validateRequestBody, login);

// Update user by ID
usersRouter
  .route("/")
  .patch(
    verifyToken,
    createAndUpdateUserValidation(true),
    validateRequestBody,
    updateUser
  );

// Delete user by ID
usersRouter.route("/").delete(verifyToken, deleteUser);

export default usersRouter;
