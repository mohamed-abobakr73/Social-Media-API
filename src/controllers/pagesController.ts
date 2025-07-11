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
  async (req: Request, res: Response, next: NextFunction) => {
    const { pageId } = req.params;

    const page = await pagesServices.getPageByIdService(pageId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { page },
    });
  }
);

const createPage = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;

    const pageCover = req.file?.path;

    const page = await pagesServices.createPageService(userId, {
      ...req.body,
      pageCover,
    });

    return res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: { page },
    });
  }
);

const updatePage = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;
    const { pageId } = req.params;

    const pageCover = req.file?.path;

    const updatedPage = await pagesServices.updatePageService(userId, pageId, {
      ...req.body,
      pageCover,
    });

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { updatedPage },
    });
  }
);

const deletePage = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;
    const { pageId } = req.params;

    await pagesServices.deletePageService(userId, pageId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "Page deleted successfully" },
    });
  }
);

export { getAllPages, getPageById, createPage, updatePage, deletePage };
