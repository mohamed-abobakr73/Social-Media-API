import { Router } from "express";
import {
  updateFriendRequestStatusValidation,
  validateRequestBody,
  verifyToken,
} from "../middlewares";
import {
  getFriendRequestsHandler,
  sendFriendRequest,
  updateFriendRequestStatusService,
  cancelFriendRequest,
  deleteFriendship,
  getFriendships,
} from "../controllers/friendshipController";

const friendshipRouter = Router();

friendshipRouter.route("/request").get(verifyToken, getFriendRequestsHandler);

friendshipRouter.route("/request/:userId").post(verifyToken, sendFriendRequest);

friendshipRouter
  .route("/request/:friendRequestId")
  .patch(
    verifyToken,
    updateFriendRequestStatusValidation(),
    validateRequestBody,
    updateFriendRequestStatusService
  );

friendshipRouter
  .route("/request/:friendRequestId")
  .delete(verifyToken, cancelFriendRequest);

friendshipRouter.route("/").get(verifyToken, getFriendships);

friendshipRouter.route("/:friendshipId").delete(verifyToken, deleteFriendship);

export default friendshipRouter;
