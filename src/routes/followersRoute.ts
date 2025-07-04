import { Router } from "express";
import { followResource } from "../controllers/followersController";
import {
  followResourceValidation,
  validateRequestBody,
  verifyToken,
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

export default followersRouter;
