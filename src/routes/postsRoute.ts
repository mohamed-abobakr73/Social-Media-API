import { Router } from "express";
import {
  addComment,
  createPost,
  deleteComment,
  deletePost,
  getAllPosts,
  getPostById,
  handleLikePost,
  sharePost,
  updatePost,
} from "../controllers/postsController";
import createPostValidation from "../middlewares/createPostValidation";
import verifyToken from "../middlewares/verifyToken";
import isAllowed from "../middlewares/isAllowed";
import updatePostValidation from "../middlewares/updatePostValidation";
import getAllPostsValidation from "../middlewares/getAllPostsValidation";
import userIdValidation from "../middlewares/userIdValidation";
import addCommentValidation from "../middlewares/addCommentValidation";
import upload from "../config/cloudinaryConfig";
import addReportValidation from "../middlewares/addReportValidation";
import { addReport, removeReport } from "../controllers/reportsController";
import removeReportValidation from "../middlewares/removeReportValidation";

const postsRouter = Router();

// Get All posts from [users, groups, pages];
postsRouter.route("/").get(getAllPostsValidation(), getAllPosts);

// Get post by ID
postsRouter.route("/:postId").get(getPostById);

// Create post
postsRouter
  .route("/")
  .post(
    verifyToken,
    isAllowed("user", "superAdmin"),
    upload.array("files", 100),
    createPostValidation(),
    createPost
  );

// Update post
postsRouter
  .route("/:postId")
  .patch(verifyToken, updatePostValidation(), updatePost);

// Remove a report
postsRouter.route("/reports").delete(removeReportValidation(), removeReport);

// Delete post
postsRouter
  .route("/:postId")
  .delete(verifyToken, userIdValidation(), deletePost);

// Handle like post
postsRouter
  .route("/:postId/likes")
  .post(verifyToken, userIdValidation(), handleLikePost);

// Add comment to post
postsRouter
  .route("/:postId/comments")
  .post(verifyToken, addCommentValidation(), addComment);

// Delete comment
postsRouter
  .route("/:postId/comments/:commentId")
  .delete(verifyToken, userIdValidation(), deleteComment);

// Share post
postsRouter
  .route("/:postId/share")
  .post(verifyToken, userIdValidation(), sharePost);

// Report a post
postsRouter.route("/reports").post(addReportValidation(), addReport);
export default postsRouter;
