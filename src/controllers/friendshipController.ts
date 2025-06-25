import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../middlewares";
import httpStatusText from "../utils/httpStatusText";
import { friendshipServices } from "../services/";

const getFriendRequestsHandler = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;
    const type = req.query.type as "sent" | "received";

    const friendRequests = await friendshipServices.getFriendRequestsService(
      userId,
      type
    );

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { friendRequests },
    });
  }
);

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

const cancelFriendRequest = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { friendRequestId } = req.params;
    const { userId } = req.currentUser!;

    await friendshipServices.cancelFriendRequestService(
      userId,
      friendRequestId
    );

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "Friend request canceled successfully" },
    });
  }
);

const deleteFriendship = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { friendshipId } = req.params;
    const { userId } = req.currentUser!;

    await friendshipServices.deleteFriendshipService(userId, friendshipId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "Friendship deleted successfully" },
    });
  }
);

export {
  getFriendRequestsHandler,
  sendFriendRequest,
  updateFriendRequestStatusService,
  cancelFriendRequest,
  deleteFriendship,
};
