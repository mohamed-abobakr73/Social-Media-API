import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../middlewares";
import httpStatusText from "../utils/httpStatusText";
import { usersServices } from "../services";
import { friendshipServices } from "../services/";

const sendFriendRequest = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId: recipientId } = req.params;
    const { userId: senderId } = req.currentUser!;

    await friendshipServices.sendFriendRequestService(senderId, recipientId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "Friend request sent successfully" },
    });
  }
);

const updateFriendRequestStatusService = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { friendRequestId } = req.params;
    const { status } = req.body;
    const { userId } = req.currentUser!;

    await friendshipServices.updateFriendRequestStatusService(userId, {
      friendRequestId,
      status,
    });

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: `Friend request ${status}` },
    });
  }
);

export { sendFriendRequest, updateFriendRequestStatusService };
