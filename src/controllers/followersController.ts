import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../middlewares";
import followersService from "../services/followersService";
import { TFollowResourceType } from "../types";

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

export { followResource };
