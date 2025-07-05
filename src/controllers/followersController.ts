import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../middlewares";
import followersService from "../services/followersService";
import { TFollowResourceType } from "../types";
import paginationQuery from "../utils/paginationQuery";

const getFollowers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { resourceType, resourceId } = req.query as {
      resourceType: TFollowResourceType;
      resourceId: string;
    };

    const pagination = paginationQuery(req.query);

    const followers = await followersService.getFollowersService(
      resourceId,
      resourceType,
      pagination
    );

    return res.status(200).json({
      status: "success",
      data: followers,
    });
  }
);

const followResource = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;
    const { resourceType, resourceId } = req.query as {
      resourceType: TFollowResourceType;
      resourceId: string;
    };

    const follower = await followersService.followResourceService(
      userId,
      resourceId,
      resourceType
    );

    return res.status(200).json({
      status: "success",
      data: { follower },
    });
  }
);

const removeFollow = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;
    const { followId } = req.params;
    const { followType } = req.query as { followType: TFollowResourceType };

    await followersService.removeFollowService(userId, followId, followType);

    return res.status(200).json({
      status: "success",
      data: { message: "Follow removed successfully" },
    });
  }
);

export { getFollowers, followResource, removeFollow };
