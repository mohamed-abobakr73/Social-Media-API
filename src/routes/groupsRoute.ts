import { Router } from "express";
import {
  createGroup,
  deleteGroup,
  getAllGroups,
  getGroupById,
  handleJoinRequests,
  joinGroup,
  leaveGroup,
  updateGroup,
} from "../controllers/groupsController";
import {
  createGroupValidation,
  verifyToken,
  isAllowed,
  joinGroupValidation,
  handleJoinRequestValidation,
  userIdValidation,
  updateGroupValidation,
  addReportValidation,
  removeReportValidation,
  validateRequestBody,
} from "../middlewares/";
import { upload } from "../config/";
import { addReport, removeReport } from "../controllers/reportsController";

const groupsRouter = Router();

// Get all groups
groupsRouter.route("/").get(getAllGroups);

// Get group by ID
groupsRouter.route("/:groupId").get(getGroupById);

// Create group
groupsRouter
  .route("/")
  .post(
    verifyToken,
    isAllowed("user", "superAdmin"),
    upload.single("cover"),
    createGroupValidation(),
    validateRequestBody,
    createGroup
  );

groupsRouter
  .route("/:groupId")
  .patch(
    verifyToken,
    upload.single("cover"),
    updateGroupValidation(),
    validateRequestBody,
    updateGroup
  );

// Remove a report
groupsRouter
  .route("/reports")
  .delete(removeReportValidation(), validateRequestBody, removeReport);

// Delete group
groupsRouter.route("/:groupId").delete(verifyToken, deleteGroup);

// Join group
groupsRouter
  .route("/:groupId/join")
  .post(verifyToken, joinGroupValidation(), validateRequestBody, joinGroup);

// Handle join request
groupsRouter
  .route("/:groupId/join-requests")
  .post(
    verifyToken,
    handleJoinRequestValidation(),
    validateRequestBody,
    handleJoinRequests
  );

// Leave group
groupsRouter
  .route("/:groupId/leave")
  .post(verifyToken, userIdValidation(), validateRequestBody, leaveGroup);

// Report a group
groupsRouter
  .route("/reports")
  .post(addReportValidation(), validateRequestBody, addReport);

export default groupsRouter;
