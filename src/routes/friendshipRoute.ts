import { Router } from "express";
import {
  updateFriendRequestStatusValidation,
  validateRequestBody,
  verifyToken,
} from "../middlewares";
import {
  getFriendRequests,
  sendFriendRequest,
  updateFriendRequestStatusService,
} from "../controllers/friendshipController";

const friendshipRouter = Router();

friendshipRouter.route("/").get(verifyToken, getFriendRequests);

friendshipRouter.route("/:userId").post(verifyToken, sendFriendRequest);

friendshipRouter
  .route("/:friendRequestId")
  .patch(
    verifyToken,
    updateFriendRequestStatusValidation(),
    validateRequestBody,
    updateFriendRequestStatusService
  );

export default friendshipRouter;
