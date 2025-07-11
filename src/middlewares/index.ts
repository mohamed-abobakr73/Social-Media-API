import createOrUpdateCommentValidation from "./createOrUpdateCommentValidation";
import addOrRemoveFollowedUsersValidation from "./addOrRemoveFollowedUsersValidation";
import createAndUpdateUserValidation from "./createAndUpdateUserValidation";
import loginValidation from "./loginValidation";
import sendFriendRequestValidation from "./sendFriendRequestValidation";
import updateFriendRequestStatusValidation from "./updateFriendRequestStatusValidation";
import updateOrDeleteMessageValidation from "./updateOrDeleteMessageValidation";
import verifyToken from "./verifyToken";
import addReportValidation from "./addReportValidation";
import removeReportValidation from "./removeReportValidation";
import userIdValidation from "./userIdValidation";
import createOrUpdatePageValidation from "./createOrUpdatePageValidation";
import createPostValidation from "./createPostValidation";
import updatePostValidation from "./updatePostValidation";
import getAllPostsValidation from "./getAllPostsValidation";
import isAllowed from "./isAllowed";
import notFoundRoutes from "./notFoundRoutes";
import searchValidation from "./searchValidation";
import asyncWrapper from "./asyncWrapper";
import globalErrorHandler from "./globalErrorHandler";
import imageValidation from "./imageValidation";
import handleJoinRequestValidation from "./handleJoinRequestValidation";
import updateGroupValidation from "./updateGroupValidation";
import joinGroupValidation from "./joinGroupValidation";
import createGroupValidation from "./createGroupValidation";
import sendMessageValidation from "./sendMessageValidation";
import validateRequestBody from "./validateRequestBody";
import createChatValidation from "./createChatValidation";
import followResourceValidation from "./followResourceValidation";
import unFollowResourceValidation from "./unFollowResourceValidation";

export {
  createOrUpdateCommentValidation,
  addOrRemoveFollowedUsersValidation,
  createAndUpdateUserValidation,
  loginValidation,
  sendFriendRequestValidation,
  updateFriendRequestStatusValidation,
  updateOrDeleteMessageValidation,
  verifyToken,
  addReportValidation,
  removeReportValidation,
  userIdValidation,
  createOrUpdatePageValidation,
  createPostValidation,
  updatePostValidation,
  getAllPostsValidation,
  isAllowed,
  notFoundRoutes,
  searchValidation,
  asyncWrapper,
  globalErrorHandler,
  imageValidation,
  handleJoinRequestValidation,
  updateGroupValidation,
  joinGroupValidation,
  createGroupValidation,
  sendMessageValidation,
  validateRequestBody,
  createChatValidation,
  followResourceValidation,
  unFollowResourceValidation,
};
