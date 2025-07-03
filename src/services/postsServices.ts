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
import assertUserIsAllowed from "../utils/assertUserIsAllowed";

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
      assertUserIsAllowed(postOwnerId, author, "You can only post as yourself");
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

  assertUserIsAllowed(
    userId,
    post.author.toString(),
    "You can only update your own posts"
  );

  const { postTitle, postContent, images } = updateData;

  if (postTitle) post.postTitle = postTitle;
  if (postContent) post.postContent = postContent;
  if (images) post.images = images;

  await post.save();

  return post;
};

const deletePostService = async (postId: string, userId: string) => {
  const user = await User.findById(userId);
  const post = await Post.findById(postId);

  doesResourceExists(
    user,
    "You are not authorized to delete this post",
    401,
    httpStatusText.FAIL
  );
  doesResourceExists(post, "Post not found");

  assertUserIsAllowed(
    userId,
    post.author.toString(),
    "You can only delete your own posts"
  );

  post.isDeleted = true;
  await post.save();
};

const handlePostLikesService = async (postId: string, userId: string) => {
  const user = await User.findById(userId);
  const post = await Post.findById(postId);

  doesResourceExists(
    user,
    "You are not authorized to like this post",
    401,
    httpStatusText.FAIL
  );
  doesResourceExists(post, "Post not found");

  let status: string;

  const userLikedPost = post.likes.find(
    (like) => like.toString() === user._id.toString()
  );

  if (userLikedPost) {
    post.likes = post.likes.filter(
      (like) => like.toString() !== user._id.toString()
    );
    post.likesCount--;
    await post.save();
    status = "unlike";
  } else {
    post.likes.push(user._id);
    post.likesCount++;
    await post.save();
    status = "like";
  }

  return status;
};

// add notifications
const sharePostService = async (postId: string, userId: string) => {
  const user = await User.findById(userId);
  const post = await Post.findById(postId, {
    __v: 0,
    // _id: 0,
    createdAt: 0,
    updatedAt: 0,
  });

  doesResourceExists(
    user,
    "You are not authorized to share this post",
    401,
    httpStatusText.FAIL
  );
  doesResourceExists(post, "Post not found", 400, httpStatusText.FAIL);

  const postClone = {
    sharedBy: user._id,
    postTitle: post.postTitle,
    postContent: post.postContent,
    images: post.images,
    author: post.author,
    postOwnerType: post.postOwnerType,
    postOwnerId: post.postOwnerId,
    originalPostId: post.originalPostId,
  };

  const sharedPost = new Post(postClone);

  post.sharesCount += 1;

  await post.save();
  await sharedPost.save();

  return sharedPost;
};

export default {
  getAllPostsService,
  getPostByIdService,
  createPostService,
  updatePostService,
  deletePostService,
  handlePostLikesService,
  sharePostService,
};
