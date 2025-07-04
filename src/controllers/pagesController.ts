import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import pagesServices from "../services/pagesServices";
import httpStatusText from "../utils/httpStatusText";
import paginationQuery from "../utils/paginationQuery";

const getAllPages = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const pagination = paginationQuery(req.query);

    const pages = await pagesServices.getAllPagesService(pagination);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: pages,
    });
  }
);

const getPageById = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { pageId } = req.params;

    const getPageResult = await pagesServices.getPageByIdService(pageId);

    if (getPageResult.type === "error") {
      return next(getPageResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { page: getPageResult.data },
      });
    }
  }
);

const createPage = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const pageCover = req.file?.path;
    const createPageResult = await pagesServices.createPageService({
      ...req.body,
      pageCover,
    });

    if (createPageResult.type === "error") {
      return next(createPageResult.error);
    } else {
      return res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { page: createPageResult.data },
      });
    }
  }
);

const updatePage = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { pageId } = req.params;
    const { userId } = req.body;

    const pageCover = req.file?.path;

    const updatePageResult = await pagesServices.updatePageService(
      pageId,
      userId,
      { ...req.body, pageCover }
    );

    if (updatePageResult.type === "error") {
      return next(updatePageResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { page: updatePageResult.data },
      });
    }
  }
);

const deletePage = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { pageId } = req.params;
    const { userId } = req.body;

    const deletePageResult = await pagesServices.deletePageService(
      pageId,
      userId
    );

    if (deletePageResult.type === "error") {
      return next(deletePageResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "Page deleted successfully" },
      });
    }
  }
);

const addFollowers = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { pageId } = req.params;
    const { userId } = req.body;

    const addFollowersResult = await pagesServices.addFollowersService(
      pageId,
      userId
    );

    if (addFollowersResult.type === "error") {
      return next(addFollowersResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You are now following this page" },
      });
    }
  }
);

const removeFollowers = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { pageId } = req.params;
    const { userId } = req.body;

    const removeFollowersResult = await pagesServices.removeFollowersService(
      pageId,
      userId
    );

    if (removeFollowersResult.type === "error") {
      return next(removeFollowersResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You are not following this page anymore" },
      });
    }
  }
);

export {
  getAllPages,
  getPageById,
  createPage,
  updatePage,
  deletePage,
  addFollowers,
  removeFollowers,
};
