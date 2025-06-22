import { Router } from "express";
import { search } from "../controllers/searchController";
import { searchValidation, validateRequestBody } from "../middlewares/";

const searchRouter = Router();

searchRouter
  .route("/:searchTerm")
  .post(searchValidation(), validateRequestBody, search);

export default searchRouter;
