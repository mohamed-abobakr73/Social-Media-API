import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import groupsServices from "../services/groupsServices";
import httpStatusText from "../utils/httpStatusText";
import paginationQuery from "../utils/paginationQuery";

const getAllGroups = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { limit, skip } = paginationQuery(req.query);

    const { groups, paginationInfo } = await groupsServices.getAllGroupsService(
      {
        limit,
        skip,
      }
    );

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { groups, paginationInfo },
    });
  }
);

const getGroupById = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;

    const group = await groupsServices.getGroupByIdService(groupId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { group },
    });
  }
);

const createGroup = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.currentUser!;
    const groupCover = req.file?.path;

    const group = await groupsServices.createGroupService(userId, {
      ...req.body,
      groupCover,
    });

    return res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: { group },
    });
  }
);

const updateGroup = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { groupId } = req.params;
    const { userId } = req.body;
    const updateData = {
      groupName: req.body.groupName,
      isPrivate: req.body.isPrivate,
    };

    const groupCover = req.file?.path;

    const updateGroupResult = await groupsServices.updateGroupService(
      groupId,
      userId,
      { ...updateData, groupCover }
    );

    if (updateGroupResult.type === "error") {
      return next(updateGroupResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { group: updateGroupResult.data },
      });
    }
  }
);

const deleteGroup = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { groupId } = req.params;
    const { userId } = req.body;
    const deleteGroupResult = await groupsServices.deleteGroupService(
      groupId,
      userId
    );
    if (deleteGroupResult.type === "error") {
      return next(deleteGroupResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { group: deleteGroupResult.data },
      });
    }
  }
);

// TODO check the notifications thing
const joinGroup = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.currentUser!;
    const { groupId } = req.params;
    // const { notifications } = req.query;

    const joinGroupResult = await groupsServices.joinGroupService(
      userId,
      groupId
      // notifications
    );

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: {
        message:
          joinGroupResult === "pending"
            ? "You have sent a join request successfully, please wait for the admin to approve"
            : "You have joined this group successfully",
      },
    });
  }
);

const handleJoinRequests = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { groupId } = req.params;
    const { status } = req.body;

    const handleJoinRequestsResult =
      await groupsServices.handleJoinRequestsService({ groupId, ...req.body });
    //   if (handleJoinRequestsResult.type === "error") {
    //     return next(handleJoinRequestsResult.error);
    //   } else {
    //     return res.status(200).json({
    //       status: httpStatusText.SUCCESS,
    //       data: { message: `You have ${status} this request successfully` },
    //     });
    //   }
  }
);

const leaveGroup = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { groupId } = req.params;
    const { userId } = req.body;

    const leaveGroupResult = await groupsServices.leaveGroupService(
      userId,
      groupId
    );
    if (leaveGroupResult.type === "error") {
      return next(leaveGroupResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You have left this group succesfully" },
      });
    }
  }
);

export {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  joinGroup,
  handleJoinRequests,
  leaveGroup,
};
