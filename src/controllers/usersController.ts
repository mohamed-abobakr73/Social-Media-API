import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import usersServices from "../services/usersServices";
import httpStatusText from "../utils/httpStatusText";
import { validationResult } from "express-validator";
import AppError from "../utils/AppError";

const getAllUsers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await usersServices.getAllUsersService();
    return res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, data: { users } });
  }
);

const getUserById = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const user = await usersServices.getUserByIdService(userId);
    if (user.type === "error") {
      return next(user.error);
    } else {
      return res
        .status(200)
        .json({ status: httpStatusText.SUCCESS, data: { user } });
    }
  }
);

const createUser = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new AppError(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const uploadedImage = req.file?.path;

    const userData = {
      ...req.body,
      profilePicture: uploadedImage,
    };

    const userResult = await usersServices.createUserService(userData);
    if (userResult.type === "error") {
      return next(userResult.error);
    } else {
      return res.status(201).json({
        status: httpStatusText.SUCCESS,
        data: { user: userResult.data, token: userResult.token },
      });
    }
  }
);

const login = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      const error = new AppError(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const loginResult = await usersServices.loginService(req.body);
    if (loginResult.type === "error") {
      return next(loginResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { token: loginResult.token },
      });
    }
  }
);

const updateUser = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new AppError(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const profilePicture = req.file?.path;

    const updateUserResult = await usersServices.updateUserService(userId, {
      ...req.body,
      profilePicture,
    });

    if (updateUserResult.type === "error") {
      return next(updateUserResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { user: updateUserResult.data },
      });
    }
  }
);

const deleteUser = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.body;
    console.log(userId);
    const deleteResult = await usersServices.deleteUserService(userId);
    console.log(deleteResult);
    if (deleteResult.type === "error") {
      return next(deleteResult.error);
    }
    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "User deleted successfully" },
    });
  }
);

const addFriendRequest = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { senderId } = req.params;
    const { recipientId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new AppError(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }

    const sendingFriendRequestResult =
      await usersServices.addFriendRequestService(senderId, recipientId);
    if (sendingFriendRequestResult.type === "error") {
      return next(sendingFriendRequestResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "Friend request sent successfuly" },
      });
    }
  }
);

const updateFriendRequestStatusService = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const { senderId, newStatus } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new AppError(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const updatedFriendRequestStatusResult =
      await usersServices.updateFriendRequestStatusService(userId, {
        sender: senderId,
        status: newStatus,
      });
    if (updatedFriendRequestStatusResult.type === "error") {
      return next(updatedFriendRequestStatusResult.error);
    } else {
      if (newStatus === "accepted") {
        return res.status(200).json({
          status: httpStatusText.SUCCESS,
          data: { message: "Friend request accepted" },
        });
      } else {
        return res.status(200).json({
          status: httpStatusText.SUCCESS,
          data: { message: "Friend request decliend" },
        });
      }
    }
  }
);

const addToBlockList = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const { userToBlockId } = req.body;
    const addToBlockListResult = await usersServices.addToBlockListService(
      userId,
      userToBlockId
    );
    if (addToBlockListResult.type === "error") {
      return next(addToBlockListResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You have successfuly blocked this user" },
      });
    }
  }
);

const removeFromBlockList = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const { blockedUserId } = req.body;
    const addToBlockListResult = await usersServices.removeFromBlockListService(
      userId,
      blockedUserId
    );
    if (addToBlockListResult.type === "error") {
      return next(addToBlockListResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You have successfuly unblocked this user" },
      });
    }
  }
);

const joinGroup = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {}
);

const leaveGroup = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {}
);

const addFollowedUsers = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const { followedUserId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new AppError(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const addFollowedUserResult = await usersServices.addFollowedUserService(
      userId,
      followedUserId
    );
    if (addFollowedUserResult.type === "error") {
      return next(addFollowedUserResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You are now following this user" },
      });
    }
  }
);

const removeFollowedUsers = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.params;
    const { followedUserId } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new AppError(errors.array(), 400, httpStatusText.ERROR);
      return next(error);
    }
    const removeFollowedUserResult =
      await usersServices.removeFollowedUserService(userId, followedUserId);
    if (removeFollowedUserResult.type === "error") {
      return next(removeFollowedUserResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: { message: "You are not following this user anymore" },
      });
    }
  }
);

const addFollowedPages = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {}
);

// const addFollowers = asyncWrapper(
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<Response | void> => {}
// );

// const reportUser = asyncWrapper(
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<Response | void> => {
//     const { reportedBy, reportedUserId, reason } = req.body;
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const error = new AppError(errors.array(), 400, httpStatusText.ERROR);
//       return next(error);
//     }
//     const addReportResult = await usersServices.addReportsService(
//       reportedUserId,
//       { reportedBy, reason }
//     );
//     if (addReportResult.type === "error") {
//       return next(addReportResult.error);
//     } else {
//       return res.status(200).json({
//         status: httpStatusText.SUCCESS,
//         data: {
//           message: "Your report has been recorded and will be reviewed",
//         },
//       });
//     }
//   }
// );

// const removeReport = asyncWrapper(
//   async (
//     req: Request,
//     res: Response,
//     next: NextFunction
//   ): Promise<Response | void> => {
//     const { reportedUserId, reportedBy } = req.body;
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       const error = new AppError(errors.array(), 400, httpStatusText.ERROR);
//       return next(error);
//     }

//     const removeReportResult = await usersServices.removeReportsService(
//       reportedBy,
//       reportedUserId
//     );
//     if (removeReportResult.type === "error") {
//       return next(removeReportResult.error);
//     } else {
//       return res.status(200).json({
//         staus: httpStatusText.SUCCESS,
//         data: { message: "You have removed this report successfuly" },
//       });
//     }
//   }
// );

export {
  getAllUsers,
  getUserById,
  createUser,
  login,
  updateUser,
  deleteUser,
  addFriendRequest,
  updateFriendRequestStatusService,
  addToBlockList,
  removeFromBlockList,
  joinGroup,
  leaveGroup,
  addFollowedUsers,
  removeFollowedUsers,
  addFollowedPages,
  // addFollowers,
  // reportUser,
  // removeReport,
};
