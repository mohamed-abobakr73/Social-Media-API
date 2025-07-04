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
  userIdValidation,
  verifyToken,
  validateRequestBody,
  addReportValidation,
  removeReportValidation,
} from "../middlewares/";
import { upload } from "../config/";

import { addReport, removeReport } from "../controllers/reportsController";

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

// Remove a report
pagesRouter
  .route("/reports")
  .delete(removeReportValidation(), validateRequestBody, removeReport);

// Delete page
pagesRouter.route("/:pageId").delete(verifyToken, deletePage);

// Report a page
pagesRouter
  .route("/reports")
  .post(addReportValidation(), validateRequestBody, addReport);

export default pagesRouter;
