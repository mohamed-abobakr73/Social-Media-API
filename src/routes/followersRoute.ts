import { Router } from "express";
import {
  followResource,
  removeFollow,
} from "../controllers/followersController";
import {
  followResourceValidation,
  validateRequestBody,
  verifyToken,
  unFollowResourceValidation,
} from "../middlewares";

const followersRouter = Router();

followersRouter
  .route("/")
  .post(
    verifyToken,
    followResourceValidation(),
    validateRequestBody,
    followResource
  );

followersRouter
  .route("/:followId")
  .delete(
    verifyToken,
    unFollowResourceValidation(),
    validateRequestBody,
    removeFollow
  );

export default followersRouter;
