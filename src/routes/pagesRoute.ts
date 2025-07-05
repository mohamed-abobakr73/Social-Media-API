import { Router } from "express";
import {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
} from "../controllers/pagesController";
import {
  createOrUpdatePageValidation,
  verifyToken,
  validateRequestBody,
} from "../middlewares/";
import { upload } from "../config/";

const pagesRouter = Router();

// Get all pages
pagesRouter.route("/").get(getAllPages);

// Get page by id
pagesRouter.route("/:pageId").get(getPageById);

// Create page
pagesRouter
  .route("/")
  .post(
    verifyToken,
    upload.single("cover"),
    createOrUpdatePageValidation(),
    validateRequestBody,
    createPage
  );

// Update page
pagesRouter
  .route("/:pageId")
  .patch(
    verifyToken,
    upload.single("cover"),
    createOrUpdatePageValidation(),
    validateRequestBody,
    updatePage
  );

// Delete page
pagesRouter.route("/:pageId").delete(verifyToken, deletePage);

export default pagesRouter;
