import { Page } from "../models/pagesModel";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import { TServiceResult } from "../types/serviceResult";
import { User } from "../models/usersModel";
import notificationsServices from "./notificationsServices";
import { TPage } from "../types";
import doesResourceExists from "../utils/doesResourceExists";
import assertUserIsAllowed from "../utils/assertUserIsAllowed";

const pageAndUserStarterService = async (pageId: string, userId: string) => {
  const page = await Page.findById(pageId, { __v: 0 });
  const user = await User.findById(userId, { _id: 1 });

  doesResourceExists(page, "Page not found");
  doesResourceExists(
    user,
    "You are not authorized to do this action",
    401,
    httpStatusText.FAIL
  );

  assertUserIsAllowed(
    userId,
    page.createdBy.toString(),
    "You can't do this action"
  );

  return { page, user };
};

const getAllPagesService = async (paginationData: {
  limit: number;
  skip: number;
}) => {
  const { limit, skip } = paginationData;

  const pages = await Page.find({}, { __v: 0 }).limit(limit).skip(skip);

  const totalCount = await Page.countDocuments();

  const paginationInfo = {
    totalItems: totalCount,
    totalPages: Math.ceil(totalCount / limit),
    currentPage: Math.ceil(skip / limit) + 1,
    itemsPerPage: limit,
  };

  return { pages, paginationInfo };
};

const getPageByIdService = async (pageId: string) => {
  const page = await Page.findById(pageId, { __v: 0 });

  doesResourceExists(page, "Page not found");

  return page;
};

const createPageService = async (
  userId: string,
  pageData: {
    pageName: string;
    pageCover?: string;
  }
) => {
  const { pageName, pageCover } = pageData;

  const user = await User.findById(userId);

  doesResourceExists(
    user,
    "You are not authorized to create a page",
    401,
    httpStatusText.FAIL
  );

  const page = new Page({
    pageName,
    createdBy: userId,
    pageCover,
  });

  await page.save();
  return page;
};

const updatePageService = async (
  userId: string,
  pageId: string,
  updateData: Partial<TPage>
) => {
  const { pageCover, pageName } = updateData;

  const { page } = await pageAndUserStarterService(pageId, userId);

  page.pageCover = pageCover || page.pageCover;
  page.pageName = pageName || page.pageName;

  const updatedPage = await page.save();

  return updatedPage;
};

const deletePageService = async (userId: string, pageId: string) => {
  const { page } = await pageAndUserStarterService(pageId, userId);

  page.isDeleted = true;

  await page.save();
};

const addFollowersService = async (pageId: string, userId: string) => {
  const page = await Page.findById(pageId);
  const user = await User.findById(userId);
  if (!page) {
    const error = new AppError("Invalid page id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userAlreadyFollowingPage = page.followers.find(
    (follower) => follower.toString() === userId
  );
  if (userAlreadyFollowingPage) {
    const error = new AppError(
      "You are already following this page",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  page.followers.push(user._id);
  user.followedPages.push(page._id);
  await page.save();
  await user.save();
  const addNotificationResult =
    await notificationsServices.addNotificationService(
      "followPage",
      page.createdBy,
      { username: user.username, content: page.pageName }
    );
  if (addNotificationResult.type === "error") {
    return { error: addNotificationResult.error!, type: "error" };
  }
  return { data: page, type: "success" };
};

const removeFollowersService = async (pageId: string, userId: string) => {
  const page = await Page.findById(pageId);
  const user = await User.findById(userId);
  if (!page) {
    const error = new AppError("Invalid page id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userFollowingPage = page.followers.find(
    (follower) => follower.toString() === userId
  );
  if (!userFollowingPage) {
    const error = new AppError(
      "You are not a follower of this page",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  page.followers = page.followers.filter(
    (follower) => follower.toString() !== userId
  );
  user.followedPages = user.followedPages.filter(
    (page) => page.toString() !== pageId
  );

  await page.save();
  await user.save();
  return { data: page, type: "success" };
};

export default {
  getAllPagesService,
  getPageByIdService,
  createPageService,
  updatePageService,
  deletePageService,
  addFollowersService,
  removeFollowersService,
};
