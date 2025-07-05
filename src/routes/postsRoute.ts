import { Router } from "express";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  getAllPosts,
  getPostById,
  getPostComments,
  updateComment,
  handleLikePost,
  sharePost,
  updatePost,
} from "../controllers/postsController";
import {
  createPostValidation,
  verifyToken,
  isAllowed,
  updatePostValidation,
  getAllPostsValidation,
  createOrUpdateCommentValidation,
  validateRequestBody,
} from "../middlewares/";
import { upload } from "../config/";

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

// Delete post
postsRouter.route("/:postId").delete(verifyToken, deletePost);

// Handle like post
postsRouter.route("/:postId/likes").post(verifyToken, handleLikePost);

// Get Post Comments
postsRouter.route("/:postId/comments").get(getPostComments);

// Add comment to post
postsRouter
  .route("/:postId/comments")
  .post(
    verifyToken,
    createOrUpdateCommentValidation(),
    validateRequestBody,
    createComment
  );

// Update Comment
postsRouter
  .route("/:postId/comments/:commentId")
  .patch(
    verifyToken,
    createOrUpdateCommentValidation(),
    validateRequestBody,
    updateComment
  );

// Delete comment
postsRouter
  .route("/:postId/comments/:commentId")
  .delete(verifyToken, deleteComment);

// Share post
postsRouter.route("/:postId/share").post(verifyToken, sharePost);

export default postsRouter;
