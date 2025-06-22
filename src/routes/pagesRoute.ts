import { Router } from "express";
import {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  addFollowers,
  removeFollowers,
} from "../controllers/pagesController";
import {
  createPageValidation,
  userIdValidation,
  updatePageValidation,
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
    createPageValidation(),
    validateRequestBody,
    createPage
  );

// Update page
pagesRouter
  .route("/:pageId")
  .patch(
    verifyToken,
    upload.single("cover"),
    updatePageValidation(),
    validateRequestBody,
    updatePage
  );

// Remove a report
pagesRouter
  .route("/reports")
  .delete(removeReportValidation(), validateRequestBody, removeReport);

// Delete page
pagesRouter
  .route("/:pageId")
  .delete(verifyToken, userIdValidation(), validateRequestBody, deletePage);

// Add followers
pagesRouter
  .route("/:pageId/followers")
  .post(verifyToken, userIdValidation(), validateRequestBody, addFollowers);

// Remove Followers
pagesRouter
  .route("/:pageId/followers")
  .delete(
    verifyToken,
    userIdValidation(),
    validateRequestBody,
    removeFollowers
  );

// Report a page
pagesRouter
  .route("/reports")
  .post(addReportValidation(), validateRequestBody, addReport);

export default pagesRouter;
