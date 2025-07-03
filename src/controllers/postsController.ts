import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import postsServices from "../services/postsServices";
import httpStatusText from "../utils/httpStatusText";
import AppError from "../utils/AppError";
import paginationQuery from "../utils/paginationQuery";
import { TPostType } from "../types";
import commentsService from "../services/commentsService";

const getAllPosts = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const paginationParams = paginationQuery(req.query);
    const { type, postsSourceId } = req.query as {
      type: TPostType;
      postsSourceId: string;
    };

    const posts = await postsServices.getAllPostsService(
      type!,
      postsSourceId,
      paginationParams
    );

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: posts,
    });
  }
);

const getPostById = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { postId } = req.params;

    const post = await postsServices.getPostByIdService(postId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { post },
    });
  }
);

const createPost = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const postImages = (req.files as Express.Multer.File[])?.map(
      (file) => file.path
    );

    const post = await postsServices.createPostService({
      ...req.body,
      postImages,
    });

    return res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: { post },
    });
  }
);

const updatePost = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;
    const { postId } = req.params;

    const updatedPost = await postsServices.updatePostService(
      userId,
      postId,
      req.body
    );

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { updatedPost },
    });
  }
);

const deletePost = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.currentUser!;
    const { postId } = req.params;

    const deletePostResult = await postsServices.deletePostService(
      postId,
      userId
    );

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "Post deleted successfully" },
    });
  }
);

const handleLikePost = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.currentUser!;
    const { postId } = req.params;

    const likeStatus = await postsServices.handlePostLikesService(
      postId,
      userId
    );

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: `You have ${likeStatus}d this post successfully` },
    });
  }
);

const getPostComments = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params;

    const comments = await commentsService.getPostCommentsService(postId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { comments },
    });
  }
);

const createComment = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.currentUser!;
    const { postId } = req.params;
    const { content } = req.body;

    const comment = await commentsService.createCommentService(
      userId,
      postId,
      content
    );

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { comment },
    });
  }
);

const updateComment = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;
    const { postId, commentId } = req.params;
    const { content } = req.body;

    const updatedComment = await commentsService.updateCommentService(
      userId,
      postId,
      commentId,
      content
    );

    return res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, data: { updatedComment } });
  }
);

const deleteComment = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;
    const { postId, commentId } = req.params;

    await commentsService.deleteCommentService(userId, postId, commentId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "Comment deleted successfully" },
    });
  }
);

const sharePost = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.currentUser!;
    const { postId } = req.params;

    const sharedPost = await postsServices.sharePostService(postId, userId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { sharedPost },
    });
  }
);

export {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  handleLikePost,
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  sharePost,
};
