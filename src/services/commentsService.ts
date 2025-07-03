import { Comment, Post, User } from "../models";
import assertUserIsAllowed from "../utils/assertUserIsAllowed";
import doesResourceExists from "../utils/doesResourceExists";
import httpStatusText from "../utils/httpStatusText";

const userPostServiceStarter = async (userId: string, postId: string) => {
  const user = await User.findById(userId);
  const post = await Post.findById(postId);

  doesResourceExists(
    user,
    "You are not authorized to comment on this post",
    401,
    httpStatusText.FAIL
  );
  doesResourceExists(post, "Post not found");

  return { user, post };
};

const updateOrDeleteCommentStarter = async (
  userId: string,
  postId: string,
  commentId: string
) => {
  const user = await User.findById(userId);
  const comment = await Comment.findById(commentId, { __v: 0 });
  const post = await Post.findById(postId);

  doesResourceExists(
    user,
    "You are not authorized to comment on this post",
    401,
    httpStatusText.FAIL
  );

  doesResourceExists(post, "Post not found");

  doesResourceExists(comment, "Comment not found");

  assertUserIsAllowed(
    comment.post.toString(),
    postId,
    "You can't do this action, invalid input data"
  );

  assertUserIsAllowed(
    userId,
    comment.createdBy.toString(),
    "You can only update your own comments"
  );

  return { user, post, comment };
};

const getPostCommentsService = async (postId: string) => {
  const post = await Post.findById(postId);

  doesResourceExists(post, "Post not found");

  const comments = await Comment.find({ post: post._id }, { __v: 0 });
  return comments;
};

const createCommentService = async (
  userId: string,
  postId: string,
  content: string
) => {
  const user = await User.findById(userId);
  const post = await Post.findById(postId);

  doesResourceExists(
    user,
    "You are not authorized to comment on this post",
    401,
    httpStatusText.FAIL
  );
  doesResourceExists(post, "Post not found");

  const commentData = {
    post: post._id,
    content,
    createdBy: user._id,
  };

  const comment = new Comment(commentData);
  await comment.save();

  return comment;
};

const updateCommentService = async (
  userId: string,
  postId: string,
  commentId: string,
  content: string
) => {
  const { comment } = await updateOrDeleteCommentStarter(
    userId,
    postId,
    commentId
  );

  comment.content = content;

  await comment.save();

  return comment;
};

const deleteCommentService = async (
  userId: string,
  postId: string,
  commentId: string
) => {
  await updateOrDeleteCommentStarter(userId, postId, commentId);

  await Comment.deleteOne({ _id: commentId });
};

export default {
  getPostCommentsService,
  createCommentService,
  updateCommentService,
  deleteCommentService,
};
