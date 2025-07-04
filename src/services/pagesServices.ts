import { Page } from "../models/pagesModel";
import httpStatusText from "../utils/httpStatusText";
import { User } from "../models/usersModel";
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

export default {
  getAllPagesService,
  getPageByIdService,
  createPageService,
  updatePageService,
  deletePageService,
};
