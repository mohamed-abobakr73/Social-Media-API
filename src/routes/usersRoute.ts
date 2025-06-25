import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  login,
  updateUser,
  deleteUser,
  addFollowedUsers,
  removeFollowedUsers,
} from "../controllers/usersController";
import { upload } from "../config/";
import {
  createAndUpdateUserValidation,
  loginValidation,
  updateFriendRequestStatusValidation,
  sendFriendRequestValidation,
  addOrRemoveFollowedUsersValidation,
  removeReportValidation,
  verifyToken,
  addReportValidation,
  validateRequestBody,
} from "../middlewares/";
import { addReport, removeReport } from "../controllers/reportsController";

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

// Remove a report
usersRouter
  .route("/reports")
  .delete(removeReportValidation(), validateRequestBody, removeReport);

// Delete user by ID
usersRouter.route("/").delete(verifyToken, deleteUser);

// Join a group by user ID
// usersRouter.post("/:userId/groups", joinGroup);

// Leave a group by user ID
// usersRouter.delete("/:id/groups", leaveGroup);

// Add followed users by user ID
usersRouter
  .route("/:userId/followed-users")
  .post(
    verifyToken,
    addOrRemoveFollowedUsersValidation(),
    validateRequestBody,
    addFollowedUsers
  );

// Remove followed users by user ID
usersRouter
  .route("/:userId/followed-users")
  .delete(
    verifyToken,
    addOrRemoveFollowedUsersValidation(),
    validateRequestBody,
    removeFollowedUsers
  );

// Add followed pages by user ID
// usersRouter.post("/:userId/followedPages", addFollowedPages);

// Add followers by user ID
// usersRouter.post("/:userId/followers", addFollowers);

// Report a user
usersRouter
  .route("/reports")
  .post(addReportValidation(), validateRequestBody, addReport);

export default usersRouter;
