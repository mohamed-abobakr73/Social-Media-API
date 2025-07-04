import { Router } from "express";
import {
  createGroup,
  deleteGroup,
  getAllGroups,
  getGroupById,
  getGroupMembers,
  getJoinRequests,
  handleJoinRequests,
  joinGroup,
  leaveGroup,
  updateGroup,
} from "../controllers/groupsController";
import {
  createGroupValidation,
  verifyToken,
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

groupsRouter.route("/:groupId/members").get(getGroupMembers);

groupsRouter.route("/:groupId/join-requests").get(verifyToken, getJoinRequests);

// Create group
groupsRouter
  .route("/")
  .post(
    verifyToken,
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
groupsRouter.route("/:groupId/join").post(verifyToken, joinGroup);

// Handle join request
groupsRouter
  .route("/join-requests/:joinRequestId")
  .patch(
    verifyToken,
    handleJoinRequestValidation(),
    validateRequestBody,
    handleJoinRequests
  );

// Leave group
groupsRouter.route("/:groupId/leave").delete(verifyToken, leaveGroup);

// Report a group
groupsRouter
  .route("/reports")
  .post(addReportValidation(), validateRequestBody, addReport);

export default groupsRouter;
