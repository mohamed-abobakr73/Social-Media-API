import { Post } from "../models/postsModel";
import { User } from "../models/usersModel";
import { Group } from "../models/groupsModel";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import { Page } from "../models/pagesModel";
import notificationsServices from "./notificationsServices";
import { TPostType, TPaginationData, TPost } from "../types";
import paginationResult from "../utils/paginationResult";
import doesResourceExists from "../utils/doesResourceExists";
import groupsServices from "./groupsServices";

const checkIfUserIsAuthor = (user: string, author: string) => {
  if (user !== author) {
    const error = new AppError(
      "You are not authorized to do this action",
      401,
      httpStatusText.FAIL
    );
    throw error;
  }
};

const getAllPostsService = async (
  type: TPostType,
  postSourceId: string,
  paginationData: TPaginationData
) => {
  const { limit, skip } = paginationData;

  let posts: TPost[] = [];
  let postsCount: number;

  console.log(postSourceId);

  switch (type) {
    case "user":
      const user = await User.exists({ _id: postSourceId });
      doesResourceExists(user, "User not found");

      posts = await Post.find(
        { postOwnerId: postSourceId, postOwnerType: "user" },
        { __v: 0 }
      )
        .limit(limit)
        .skip(skip);

      postsCount = await Post.countDocuments({ postOwnerId: postSourceId });
      break;

    case "group":
      const group = await Group.exists({ _id: postSourceId });
      doesResourceExists(!group, "Group not found");

      posts = await Post.find({ postOwnerId: postSourceId }, { __v: 0 })
        .limit(limit)
        .skip(skip);

      postsCount = await Post.countDocuments({ postOwnerId: postSourceId });
      break;

    case "page": // TODO
      const page = await Page.exists({ _id: postSourceId });
      doesResourceExists(!page, "Page not found");

      posts = await Post.find({ postOwnerId: postSourceId }, { __v: 0 })
        .limit(limit)
        .skip(skip);

      postsCount = await Post.countDocuments({ postOwnerId: postSourceId });
      break;
  }

  const paginationInfo = paginationResult(postsCount, skip, limit);

  return { posts, paginationInfo };
};

const getPostByIdService = async (postId: string) => {
  const post = await Post.findById(postId, { __v: 0 });
  doesResourceExists(post, "Post not found");

  return post;
};

// TODO Check if the user is the page admin or owner when he tries to add a post to it
const createPostService = async (postData: {
  type: TPostType;
  postTitle?: string;
  postContent: string;
  postImages?: string[];
  author: string;
  postOwnerId: string;
}) => {
  const { type, postTitle, postContent, postImages, author, postOwnerId } =
    postData;

  const user = await User.findById(author);

  doesResourceExists(
    user,
    "You are not authorized to create a post",
    401,
    httpStatusText.FAIL
  );

  switch (type) {
    case "user":
      if (author !== postOwnerId) {
        const error = new AppError(
          "You can only post as yourself",
          403,
          httpStatusText.FAIL
        );
        throw error;
      }
      break;

    case "group":
      const group = await Group.findById(postOwnerId);
      doesResourceExists(group, "Group not found");

      const userGroupMembership =
        await groupsServices.getUserGroupMembershipService(
          group._id.toString(),
          author
        );
      doesResourceExists(
        userGroupMembership,
        "You are not a member of this group",
        400,
        httpStatusText.FAIL
      );
      break;

    case "page":
      const page = await Page.findById(postOwnerId);
      // Check if the user is admin or page owner
      doesResourceExists(page, "Page not found");
      break;

    default:
      throw new AppError("Invalid post type", 400, httpStatusText.FAIL);
  }

  const post = new Post({
    postTitle: postTitle,
    postContent,
    images: postImages,
    author,
    postOwnerType: type,
    postOwnerId,
  });

  post.originalPostId = post._id;

  await post.save();
  return post;
};

const updatePostService = async (
  userId: string,
  postId: string,
  updateData: { postTitle?: string; postContent?: string; images?: string[] }
) => {
  const user = await User.findById(userId);
  const post = await Post.findById(postId, { __v: 0 });

  doesResourceExists(
    user,
    "You are not authorized to update this post",
    401,
    httpStatusText.FAIL
  );

  doesResourceExists(post, "Post not found", 400, httpStatusText.FAIL);

  checkIfUserIsAuthor(userId, post.author.toString());

  const { postTitle, postContent, images } = updateData;

  if (postTitle) post.postTitle = postTitle;
  if (postContent) post.postContent = postContent;
  if (images) post.images = images;

  await post.save();

  return post;
};

// const deletePostService = async (
//   postId: string,
//   userId: string
// ): Promise<TServiceResult<TPost>> => {
//   const user = await User.findById(userId);
//   const post = await Post.findById(postId);
//   if (!post) {
//     const error = new AppError("Invalid post id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }
//   if (!user) {
//     const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }

//   const isUserPostCreator = post.createdBy.toString() === userId;
//   if (!isUserPostCreator) {
//     const error = new AppError(
//       "Only post creator can delete this post",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }

//   if (post.isDeleted) {
//     const error = new AppError(
//       "This post is already deleted",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }

//   post.isDeleted = true;
//   await post.save();
//   return { type: "success" };
// };

// const handleLikePostService = async (
//   postId: string,
//   userId: mongoose.Types.ObjectId
// ): Promise<TServiceResult<TPost> & { status?: "liked" | "unliked" }> => {
//   const post = await Post.findById(postId);
//   const user = await User.findById(userId);

//   if (!post) {
//     const error = new AppError("Invalid post id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }

//   if (!user) {
//     const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }

//   const userLikedPost = post.likes.find(
//     (like) => like.toString() === userId.toString()
//   );

//   if (userLikedPost) {
//     post.likes = post.likes.filter(
//       (like) => like.toString() !== userId.toString()
//     );
//     await post.save();
//     return { status: "unliked", type: "success" };
//   } else {
//     post.likes.push(userId);
//     const addNotificationResult =
//       await notificationsServices.addNotificationService(
//         "likePost",
//         post.createdBy,
//         { username: user.username }
//       );
//     await post.save();
//     if (addNotificationResult.type === "error") {
//       return { error: addNotificationResult.error!, type: "error" };
//     }
//     return { status: "liked", type: "success" };
//   }
// };

// const addCommentService = async (
//   postId: string,
//   commentData: {
//     content: string;
//     createdBy: mongoose.Types.ObjectId;
//   }
// ): Promise<TServiceResult<TPost>> => {
//   const { createdBy } = commentData;
//   const post = await Post.findById(postId);
//   const user = await User.findById(createdBy);

//   if (!post) {
//     const error = new AppError("Invalid post id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }

//   if (!user) {
//     const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }

//   post.comments.push(commentData);
//   await post.save();
//   const addNotificationResult =
//     await notificationsServices.addNotificationService(
//       "commentPost",
//       post.createdBy,
//       { username: user.username, content: commentData.content }
//     );
//   if (addNotificationResult.type === "error") {
//     return { error: addNotificationResult.error!, type: "error" };
//   }
//   return { type: "success" };
// };

// const deleteCommentService = async (
//   postId: string,
//   userId: string,
//   commentId: string
// ): Promise<TServiceResult<TPost>> => {
//   const post = await Post.findById(postId);
//   const user = await User.findById(userId);

//   if (!post) {
//     const error = new AppError("Invalid post id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }

//   if (!user) {
//     const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }

//   const commentExists = post.comments.find(
//     (comment) => comment._id!.toString() === commentId
//   );
//   if (!commentExists) {
//     const error = new AppError(
//       "Comment does not exist",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }

//   const isUserCommentCreator = post.comments.find(
//     (comment) => comment.createdBy.toString() === userId
//   );
//   if (!isUserCommentCreator) {
//     const error = new AppError(
//       "Only the comment creator can delete this comment",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }

//   post.comments = post.comments.filter(
//     (comment) => comment._id!.toString() !== commentId
//   );

//   await post.save();
//   return { type: "success" };
// };

// const sharePostService = async (
//   postId: string,
//   userId: string
// ): Promise<TServiceResult<TPost>> => {
//   const post = await Post.findById(postId);
//   const user = await User.findById(userId);

//   if (!post) {
//     const error = new AppError("Invalid post id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }

//   if (!user) {
//     const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }

//   user.posts.push({ postId: post._id, isShared: true });
//   post.shares.push(user._id);
//   await user.save();
//   await post.save();
//   const addNotificationResult =
//     await notificationsServices.addNotificationService(
//       "sharePost",
//       post.createdBy,
//       { username: user.username }
//     );
//   if (addNotificationResult.type === "error") {
//     return { error: addNotificationResult.error!, type: "error" };
//   }
//   return { type: "success" };
// };

export default {
  getAllPostsService,
  getPostByIdService,
  createPostService,
  updatePostService,
  // deletePostService,
  // handleLikePostService,
  // addCommentService,
  // deleteCommentService,
  // sharePostService,
};
