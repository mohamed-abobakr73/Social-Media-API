import { Router } from "express";
import { verifyToken } from "../middlewares";
import { blockUser, deleteBlock } from "../controllers/blockController";

const blockRouter = Router();

blockRouter.route("/:userToBlockId").post(verifyToken, blockUser);

blockRouter.route("/:blockId").delete(verifyToken, deleteBlock);

export default blockRouter;
