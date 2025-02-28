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
import createPageValidation from "../middlewares/createPageValidation";
import upload from "../config/cloudinaryConfig";
import userIdValidation from "../middlewares/userIdValidation";
import updatePageValidation from "../middlewares/updatePageValidation";
import verifyToken from "../middlewares/verifyToken";
import addReportValidation from "../middlewares/addReportValidation";
import { addReport, removeReport } from "../controllers/reportsController";
import removeReportValidation from "../middlewares/removeReportValidation";

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
    createPage
  );

// Update page
pagesRouter
  .route("/:pageId")
  .patch(
    verifyToken,
    upload.single("cover"),
    updatePageValidation(),
    updatePage
  );

// Remove a report
pagesRouter.route("/reports").delete(removeReportValidation(), removeReport);

// Delete page
pagesRouter
  .route("/:pageId")
  .delete(verifyToken, userIdValidation(), deletePage);

// Add followers
pagesRouter
  .route("/:pageId/followers")
  .post(verifyToken, userIdValidation(), addFollowers);

// Remove Followers
pagesRouter
  .route("/:pageId/followers")
  .delete(verifyToken, userIdValidation(), removeFollowers);

// Report a page
pagesRouter.route("/reports").post(addReportValidation(), addReport);
export default pagesRouter;
