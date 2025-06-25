import { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../middlewares";
import { blockServices } from "../services/";
import httpStatusText from "../utils/httpStatusText";

const blockUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;
    const { userToBlockId } = req.params;

    await blockServices.blockUserService(userId, userToBlockId);

    return res
      .status(200)
      .json({
        status: httpStatusText.SUCCESS,
        data: { message: "User blocked successfully" },
      });
  }
);

export { blockUser };
