import mongoose from "mongoose";
import { User, IUser, IUserGroup, INotification } from "../models/usersModel";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import generateJwt from "../utils/generateJwt";
import { TServiceResult } from "../types/serviceResult";
import doesResourceExists from "../utils/doesResourceExists";
import hashItem from "../utils/hashItem";
import compareHashedItem from "../utils/compareHashedItem";

const createToken = (user: IUser) => {
  const { _id, username, email, role } = user;
  const tokenPayload = {
    userId: _id,
    username: username,
    email: email,
    role: role,
  };

  const token = generateJwt(tokenPayload);

  return token;
};

const getAllUsersService = async () => {
  const users = await User.find({}, { __v: 0 });
  return users;
};

const getUserByIdService = async (userId: string) => {
  const user = await User.findById(userId, { __v: 0 });

  doesResourceExists(user, "User not found");

  return user;
};

const createUserService = async (userData: Partial<IUser>) => {
  const { password } = userData;

  userData.password = hashItem(password);

  const user = new User(userData);

  await user.save();

  doesResourceExists(user, "Error creating user");

  const token = createToken(user);

  return { user, token };
};

const loginService = async (loginData: { email: string; password: string }) => {
  const { email, password } = loginData;

  const user = await User.findOne({ email }).select("+password -__v");

  doesResourceExists(user, "Invalid credentials");

  compareHashedItem(password, user.password, "Invalid credentials");

  const token = createToken(user);

  user.toObject();

  user.password = undefined as any;

  return { user, token };
};

const updateUserService = async (
  userId: string,
  updateData: Partial<IUser>
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...updateData,
      },
    },
    { new: true }
  );

  doesResourceExists(user, "Error updating user");

  return user;
};

const deleteUserService = async (userId: string) => {
  const deletedUser = await User.deleteOne({ _id: userId });

  doesResourceExists(deletedUser.deletedCount, "Error deleting user");
};

// TODO needs validation to check if the group exists, also add the user to the groups members list
// This goes for the rest of the functions below
// Add the accept and decline for the friend requests DONE
const joinGroupService = async (
  userId: string,
  groupData: IUserGroup
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.groups.push({
    groupId: groupData.groupId,
    notifications: groupData.notifications,
  });
  await user.save();
  return { data: user, type: "success" };
};

const leaveGroupService = async (
  userId: string,
  groupId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.groups.filter((group) => group.groupId !== groupId);
  await user.save();
  return { data: user, type: "success" };
};

const addFollowedUserService = async (
  userId: string,
  followedUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  const followedUser = await User.findById(followedUserId);

  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!followedUser) {
    const error = new AppError(
      "Invalid followed user id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const followAlreadyExists = user.followedUsers.includes(followedUserId);
  if (followAlreadyExists) {
    const error = new AppError(
      "You are already following this user",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  user.followedUsers.push(followedUserId);
  followedUser.followers.push(user._id);
  await user.save();
  await followedUser.save();
  return { data: user, type: "success" };
};

const removeFollowedUserService = async (
  userId: string,
  followedUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  const followedUser = await User.findById(followedUserId);

  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!followedUser) {
    const error = new AppError(
      "Invalid followed user id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const userIsFollowingTheFollowedUser = user.followedUsers.find(
    (followed) => followed.toString() === followedUserId.toString()
  );
  if (!userIsFollowingTheFollowedUser) {
    const error = new AppError(
      "You can't unfollow this user as you didn't follow him before",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  user.followedUsers = user.followedUsers.filter(
    (user) => user.toString() !== followedUserId.toString()
  );
  followedUser.followers = followedUser.followers.filter(
    (user) => user.toString() !== userId
  );

  await user.save();
  followedUser.save();
  return { type: "success" };
};

const addFollowedPagesService = async (
  userId: string,
  followedPageId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  const followAlreadyExists = user.followedPages.includes(followedPageId);
  if (followAlreadyExists) {
    const error = new AppError(
      "You are already following this page",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  user.followedPages.push(followedPageId);
  await user.save();
  return { data: user, type: "success" };
};

const removeFollowedPagesService = async (
  userId: string,
  followedPageId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.followedUsers.filter((page) => page._id !== followedPageId);
  await user.save();
  return { data: user, type: "success" };
};

// const addFollowersService = async (
//   userId: string,
//   followerId: mongoose.Types.ObjectId
// ): Promise<TServiceResult<IUser>> => {
//   const user = await User.findById(userId);
//   if (!user) {
//     const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }
//   user.followers.push(followerId);
//   await user.save();
//   return { data: user, type: "success" };
// };

// const removeFollowersService = async (
//   userId: string,
//   followerId: mongoose.Types.ObjectId
// ): Promise<TServiceResult<IUser>> => {
//   const user = await User.findById(userId);
//   if (!user) {
//     const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
//     return { error, type: "error" };
//   }
//   user.followers.filter((user) => user._id !== followerId);
//   await user.save();
//   return { data: user, type: "success" };
// };

// const addReportsService = async (
//   reportedUserId: string,
//   reportData: IReport
// ): Promise<TServiceResult<IUser>> => {
//   const reportedBy = await User.findById(reportData.reportedBy);
//   const reportedUser = await User.findById(reportedUserId);
//   if (!reportedUser) {
//     const error = new AppError(
//       "Invalid reported user id",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }
//   if (!reportedBy) {
//     const error = new AppError(
//       "Invalid reporter user id",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }

//   // Checking if the user already reported the other
//   const reportAlreadyExists = reportedUser.reports.find(
//     (report) =>
//       report.reportedBy.toString() === reportData.reportedBy.toString()
//   );
//   if (reportAlreadyExists) {
//     const error = new AppError(
//       "You have already reported this user",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }

//   reportedUser.reports.push(reportData);
//   reportedBy.madeReports.push({
//     userId: reportData.reportedBy,
//     reportedUserId: reportedUser._id,
//     reason: reportData.reason,
//   });

//   await reportedUser.save();
//   await reportedBy.save();
//   return { type: "success" };
// };

// const removeReportsService = async (
//   reportedById: string,
//   reportedUserId: string
// ): Promise<TServiceResult<IUser>> => {
//   const reportedBy = await User.findById(reportedById);
//   const reportedUser = await User.findById(reportedUserId);
//   if (!reportedUser) {
//     const error = new AppError(
//       "Invalid reported user id",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }
//   if (!reportedBy) {
//     const error = new AppError(
//       "Invalid reporter id",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }

//   // Check if the report exists
//   const reportExists = reportedUser.reports.find(
//     (report) => report.reportedBy.toString() === reportedById
//   );
//   if (!reportExists) {
//     const error = new AppError(
//       "There is no report to be removed",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }

//   reportedUser.reports = reportedUser.reports.filter(
//     (report) => report.reportedBy.toString() !== reportedById
//   );
//   reportedBy.madeReports = reportedBy.madeReports.filter(
//     (report) => report.reportedUserId.toString() !== reportedUserId
//   );

//   await reportedUser.save();
//   await reportedBy.save();
//   return { type: "success" };
// };

const addNotificationsService = async (
  userId: string,
  notificationData: INotification
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.notifications.push(notificationData);
  await user.save();
  return { data: user, type: "success" };
};

const markNotficationAsReadService = async (
  userId: string,
  notificationId: mongoose.Types.ObjectId
) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  const notificationToUpdate = user.notifications.find(
    (notification) => (notification._id as unknown) === notificationId
  );
  if (!notificationToUpdate) {
    const error = new AppError(
      "Invalid notification id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  notificationToUpdate.read = true;
  await user.save();
  return { data: user, type: "success" };
};

const removeNotificationsService = async (
  userId: string,
  notificationId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  user.notifications.filter(
    (notification) => (notification._id as unknown) !== notificationId
  );
  await user.save();
  return { data: user, type: "success" };
};

export default {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  loginService,
  updateUserService,
  deleteUserService,
  joinGroupService,
  leaveGroupService,
  addFollowedUserService,
  removeFollowedUserService,
  addFollowedPagesService,
  removeFollowedPagesService,
  // addFollowersService,
  // removeFollowersService,
  // addReportsService,
  // removeReportsService,
  addNotificationsService,
  markNotficationAsReadService,
  removeNotificationsService,
};
