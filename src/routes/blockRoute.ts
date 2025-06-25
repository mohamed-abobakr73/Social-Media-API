import { Router } from "express";
import { verifyToken } from "../middlewares";
import { blockUser } from "../controllers/blockController";

const blockRouter = Router();

blockRouter.route("/:userToBlockId").post(verifyToken, blockUser);

export default blockRouter;
