import { Router } from "express";
import { verifyToken } from "../middlewares";
import { sendFriendRequest } from "../controllers/friendshipController";

const friendshipRouter = Router();

friendshipRouter.route("/:userId").post(verifyToken, sendFriendRequest);

export default friendshipRouter;
