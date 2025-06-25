import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import usersServices from "../services/usersServices";
import httpStatusText from "../utils/httpStatusText";

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

    return res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, data: { user } });
  }
);

const createUser = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const uploadedImage = req.file?.path;

    const userData = {
      ...req.body,
      profilePicture: uploadedImage,
    };

    const { user, token } = await usersServices.createUserService(userData);

    return res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: { user, token: token },
    });
  }
);

const login = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { user, token } = await usersServices.loginService(req.body);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { user, token },
    });
  }
);

const updateUser = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.currentUser!;

    const user = await usersServices.updateUserService(userId, req.body);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { user },
    });
  }
);

const deleteUser = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.currentUser!;

    await usersServices.deleteUserService(userId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "User deleted successfully" },
    });
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
  addToBlockList,
  removeFromBlockList,
  joinGroup,
  leaveGroup,
  addFollowedUsers,
  removeFollowedUsers,
  addFollowedPages,
  // addFollowers,,
  // reportUser,
  // removeReport,
};
