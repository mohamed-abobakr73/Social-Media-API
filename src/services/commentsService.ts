import { Comment, Post, User } from "../models";
import doesResourceExists from "../utils/doesResourceExists";
import httpStatusText from "../utils/httpStatusText";

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

export default { createCommentService };
