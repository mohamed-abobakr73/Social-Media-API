import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import postsServices from "../services/postsServices";
import httpStatusText from "../utils/httpStatusText";
import AppError from "../utils/AppError";
import paginationQuery from "../utils/paginationQuery";
import { TPostType } from "../types";

const getAllPosts = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const paginationParams = paginationQuery(req.query);
    const type =
      (req.query as typeof req.query.status) === "string"
        ? (req.query.type as TPostType)
        : undefined;

    const { postsSourceId } = req.params;

    const posts = await postsServices.getAllPostsService(
      type!,
      postsSourceId,
      paginationParams
    );

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { posts },
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

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { post },
    });
  }
);

// const updatePost = asyncWrapper(
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<Response | void> => {
//     if (Object.keys(req.params).length === 0) {
//       const error = new AppError(
//         "No data sent to update",
//         400,
//         httpStatusText.FAIL
//       );
//       return next(error);
//     }
//     const { postId } = req.params;
//     const { userId, postTitle, postContent } = req.body;

//     const updatePostReslut = await postsServices.updatePostService(
//       userId,
//       postId,
//       { postTitle, postContent }
//     );

//     if (updatePostReslut.type === "error") {
//       return next(updatePostReslut.error);
//     } else {
//       return res.status(200).json({
//         status: httpStatusText.SUCCESS,
//         data: { updatedPost: updatePostReslut.data },
//       });
//     }
//   }
// );

// const deletePost = asyncWrapper(
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<Response | void> => {
//     const { postId } = req.params;
//     const { userId } = req.body;

//     const deletePostResult = await postsServices.deletePostService(
//       postId,
//       userId
//     );

//     if (deletePostResult.type === "error") {
//       return next(deletePostResult.error);
//     } else {
//       return res.status(200).json({
//         status: httpStatusText.SUCCESS,
//         data: { message: "Post deleted successfully" },
//       });
//     }
//   }
// );

// const handleLikePost = asyncWrapper(
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<Response | void> => {
//     const { postId } = req.params;
//     const { userId } = req.body;
//     const handleLikePostResult = await postsServices.handleLikePostService(
//       postId,
//       userId
//     );

//     if (handleLikePostResult.type === "error") {
//       return next(handleLikePostResult.error);
//     } else {
//       if (handleLikePostResult.status === "liked") {
//         return res.status(200).json({
//           status: httpStatusText.SUCCESS,
//           data: { message: "Post liked successfully" },
//         });
//       } else {
//         return res.status(200).json({
//           status: httpStatusText.SUCCESS,
//           data: { message: "Post unliked successfully" },
//         });
//       }
//     }
//   }
// );

// const addComment = asyncWrapper(
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<Response | void> => {
//     const { postId } = req.params;

//     const addCommentResult = await postsServices.addCommentService(
//       postId,
//       req.body
//     );
//     if (addCommentResult.type === "error") {
//       return next(addCommentResult.error);
//     } else {
//       return res.status(200).json({
//         status: httpStatusText.SUCCESS,
//         data: { message: "Comment added successfully" },
//       });
//     }
//   }
// );

// const deleteComment = asyncWrapper(
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<Response | void> => {
//     const { postId, commentId } = req.params;
//     const { userId } = req.body;

//     const deleteCommentResult = await postsServices.deleteCommentService(
//       postId,
//       userId,
//       commentId
//     );
//     if (deleteCommentResult.type === "error") {
//       return next(deleteCommentResult.error);
//     } else {
//       return res.status(200).json({
//         status: httpStatusText.SUCCESS,
//         data: { message: "Comment deleted successfully" },
//       });
//     }
//   }
// );

// const sharePost = asyncWrapper(
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<Response | void> => {
//     const { postId } = req.params;
//     const { userId } = req.body;

//     const sharePostResult = await postsServices.sharePostService(
//       postId,
//       userId
//     );

//     if (sharePostResult.type === "error") {
//       return next(sharePostResult.error);
//     } else {
//       return res.status(200).json({
//         status: httpStatusText.SUCCESS,
//         data: { message: "Post shared successfully" },
//       });
//     }
//   }
// );

export {
  getAllPosts,
  getPostById,
  createPost,
  // updatePost,
  // deletePost,
  // handleLikePost,
  // addComment,
  // deleteComment,
  // sharePost,
};
