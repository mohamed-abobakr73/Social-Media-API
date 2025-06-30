import { Router } from "express";
import {
  // addComment,
  createPost,
  // deleteComment,
  // deletePost,
  getAllPosts,
  getPostById,
  // handleLikePost,
  // sharePost,
  updatePost,
} from "../controllers/postsController";
import {
  createPostValidation,
  verifyToken,
  isAllowed,
  updatePostValidation,
  getAllPostsValidation,
  userIdValidation,
  addCommentValidation,
  addReportValidation,
  removeReportValidation,
  validateRequestBody,
} from "../middlewares/";
import { upload } from "../config/";
import { addReport, removeReport } from "../controllers/reportsController";

const postsRouter = Router();

// Get All posts from [users, groups, pages];
postsRouter
  .route("/")
  .get(getAllPostsValidation(), validateRequestBody, getAllPosts);

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
    validateRequestBody,
    createPost
  );

// Update post
postsRouter
  .route("/:postId")
  .patch(verifyToken, updatePostValidation(), validateRequestBody, updatePost);

// // Remove a report
// postsRouter
//   .route("/reports")
//   .delete(removeReportValidation(), validateRequestBody, removeReport);

// // Delete post
// postsRouter
//   .route("/:postId")
//   .delete(verifyToken, userIdValidation(), validateRequestBody, deletePost);

// // Handle like post
// postsRouter
//   .route("/:postId/likes")
//   .post(verifyToken, userIdValidation(), validateRequestBody, handleLikePost);

// // Add comment to post
// postsRouter
//   .route("/:postId/comments")
//   .post(verifyToken, addCommentValidation(), validateRequestBody, addComment);

// // Delete comment
// postsRouter
//   .route("/:postId/comments/:commentId")
//   .delete(verifyToken, userIdValidation(), validateRequestBody, deleteComment);

// // Share post
// postsRouter
//   .route("/:postId/share")
//   .post(verifyToken, userIdValidation(), validateRequestBody, sharePost);

// // Report a post
// postsRouter
//   .route("/reports")
//   .post(addReportValidation(), validateRequestBody, addReport);

export default postsRouter;
