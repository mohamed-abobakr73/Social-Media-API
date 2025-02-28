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
import createGroupValidation from "../middlewares/createGroupValidation";
import verifyToken from "../middlewares/verifyToken";
import isAllowed from "../middlewares/isAllowed";
import joinGroupValidation from "../middlewares/joinGroupValidation";
import handleJoinRequestValidation from "../middlewares/handleJoinRequestValidation";
import userIdValidation from "../middlewares/userIdValidation";
import upload from "../config/cloudinaryConfig";
import updateGroupValidation from "../middlewares/updateGroupValidation";
import addReportValidation from "../middlewares/addReportValidation";
import { addReport, removeReport } from "../controllers/reportsController";
import removeReportValidation from "../middlewares/removeReportValidation";

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
    createGroup
  );

groupsRouter
  .route("/:groupId")
  .patch(
    verifyToken,
    upload.single("cover"),
    updateGroupValidation(),
    updateGroup
  );

// Remove a report
groupsRouter.route("/reports").delete(removeReportValidation(), removeReport);

// Delete group
groupsRouter.route("/:groupId").delete(verifyToken, deleteGroup);

// Join group
groupsRouter
  .route("/:groupId/join")
  .post(verifyToken, joinGroupValidation(), joinGroup);

// Handle join request
groupsRouter
  .route("/:groupId/join-requests")
  .post(verifyToken, handleJoinRequestValidation(), handleJoinRequests);

// Leave group
groupsRouter
  .route("/:groupId/leave")
  .post(verifyToken, userIdValidation(), leaveGroup);

// Report a group
groupsRouter.route("/reports").post(addReportValidation(), addReport);

export default groupsRouter;
