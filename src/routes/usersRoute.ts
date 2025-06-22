import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  login,
  updateUser,
  deleteUser,
  addFriendRequest,
  updateFriendRequestStatusService,
  addToBlockList,
  removeFromBlockList,
  joinGroup,
  leaveGroup,
  addFollowedUsers,
  removeFollowedUsers,
  addFollowedPages,
  // addFollowers,
  // reportUser,
  // removeReport,
} from "../controllers/usersController";
import upload from "../config/cloudinaryConfig";
import createAndUpdateUserValidation from "../middlewares/createAndUpdateUserValidation";
import loginValidation from "../middlewares/loginValidation";
import updateFriendRequestStatusValidation from "../middlewares/updateFriendRequestStatusValidation";
import sendFriendRequestValidation from "../middlewares/sendFriendRequestValidation";
import addOrRemoveFollowedUsersValidation from "../middlewares/addOrRemoveFollowedUsersValidation";
import removeReportValidation from "../middlewares/removeReportValidation";
import verifyToken from "../middlewares/verifyToken";
import addReportValidation from "../middlewares/addReportValidation";
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
    createUser
  );

// Login
usersRouter.route("/login").post(loginValidation(), login);

// Update user by ID
usersRouter
  .route("/:userId")
  .patch(
    verifyToken,
    upload.single("profilePicture"),
    createAndUpdateUserValidation(true),
    updateUser
  );

// Remove a report
usersRouter.route("/reports").delete(removeReportValidation(), removeReport);

// Delete user by ID
usersRouter.route("/:userId").delete(verifyToken, deleteUser);

// Add friend request by user ID
usersRouter
  .route("/:senderId/friend-requests")
  .post(verifyToken, sendFriendRequestValidation(), addFriendRequest);

// Update friend request by user ID
usersRouter
  .route("/:userId/friend-requests")
  .patch(
    verifyToken,
    updateFriendRequestStatusValidation(),
    updateFriendRequestStatusService
  );

// Add to block list by user ID
usersRouter.route("/:userId/block-list").post(verifyToken, addToBlockList);

// Update block list by user ID
usersRouter
  .route("/:userId/block-list")
  .delete(verifyToken, removeFromBlockList);

// Join a group by user ID
// usersRouter.post("/:userId/groups", joinGroup);

// Leave a group by user ID
// usersRouter.delete("/:id/groups", leaveGroup);

// Add followed users by user ID
usersRouter
  .route("/:userId/followed-users")
  .post(verifyToken, addOrRemoveFollowedUsersValidation(), addFollowedUsers);

// Remove followed users by user ID
usersRouter
  .route("/:userId/followed-users")
  .delete(
    verifyToken,
    addOrRemoveFollowedUsersValidation(),
    removeFollowedUsers
  );

// Add followed pages by user ID
// usersRouter.post("/:userId/followedPages", addFollowedPages);

// Add followers by user ID
// usersRouter.post("/:userId/followers", addFollowers);

// Report a user
usersRouter.route("/reports").post(addReportValidation(), addReport);

export default usersRouter;
