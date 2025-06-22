import mongoose, { UpdateWriteOpResult } from "mongoose";
import {
  User,
  IUser,
  IFriendRequest,
  IUserGroup,
  INotification,
} from "../models/usersModel";
import { IReport } from "../types/report";
import bcrypt from "bcrypt";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import generateJwt from "../utils/generateJwt";
import { TServiceResult } from "../types/serviceResult";

const getAllUsersService = async (): Promise<IUser[]> => {
  const users = await User.find({}, { __v: 0 });
  return users;
};

const getUserByIdService = async (
  userId: string
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId, { password: 0, __v: 0 });
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  return { data: user, type: "success" };
};

const createUserService = async (
  userData: Partial<IUser>
): Promise<TServiceResult<IUser> & { token: string }> => {
  const { username, email, role, password } = userData;
  const hashedPassword = bcrypt.hashSync(password!, 10);
  userData.password = hashedPassword;
  const user = new User(userData);
  await user.save();
  const token = await generateJwt({
    id: user._id,
    username,
    email,
    role,
  });
  return { data: user, token, type: "success" };
};

const loginService = async (loginData: {
  email: string;
  password: string;
}): Promise<TServiceResult<IUser> & { token?: string }> => {
  const { email, password } = loginData;
  const user = await User.findOne({ email }, { __v: 0 });
  if (!user) {
    const error = new AppError(
      "This user does not Exist",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const comparedPasswords = bcrypt.compareSync(password, user.password);
  if (!comparedPasswords) {
    const error = new AppError(
      "Invalid credeintitals",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }
  const token = await generateJwt({
    id: user._id,
    username: user.username,
    email,
    role: user.role,
  });
  return { token, type: "success" };
};

const updateUserService = async (
  userId: string,
  updateData: {
    username?: string;
    password?: string;
    email?: string;
    gender?: number;
    age?: string;
    profilePicture?: string;
  }
): Promise<TServiceResult<IUser>> => {
  const { profilePicture, password } = updateData;
  const user = await User.findById(userId);

  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  let hashedPassword;

  if (password) {
    hashedPassword = bcrypt.hashSync(password, 10);
  }
  console.log(updateData);
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...updateData,
        profilePicture: profilePicture || user.profilePicture,
        password: hashedPassword || user.password,
      },
    },
    { new: true }
  );

  if (!updatedUser) {
    const error = new AppError(
      "An error occured during updating the user, please try again later",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  return { data: updatedUser, type: "success" };
};

const deleteUserService = async (
  userId: string
): Promise<TServiceResult<IUser>> => {
  const deletedUser = await User.deleteOne({ userId });
  if (!deletedUser.deletedCount) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  return { type: "success" };
};

const addFriendRequestService = async (
  senderId: string,
  recipientId: string
): Promise<TServiceResult<IUser>> => {
  const sender = await User.findById(senderId);
  const recipient = await User.findById(recipientId);

  if (!sender) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  if (!recipient) {
    const error = new AppError(
      "Invalid friend request recpient id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Checking if the recipient already sent a request to the sender
  const recipientAlreadySentRequest = sender.friendRequests.find(
    (request) => request.sender.toString() === recipientId
  );
  if (recipientAlreadySentRequest) {
    const error = new AppError(
      "The use you are trying to send a friend request to already sent you a friend request, check your friend requests box",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Checking if any of the users blocked the other
  const isUserBlocked = recipient.blockList.find(
    (blocked) => blocked.toString() === senderId
  );
  const senderBlockedTheRecpient = sender.blockList.find(
    (blocked) => blocked.toString() === recipientId
  );

  if (isUserBlocked) {
    const error = new AppError(
      "You can't send a friend request to this user",
      400,
      httpStatusText.FAIL
    );
    return { error, type: "error" };
  }
  if (senderBlockedTheRecpient) {
    const error = new AppError(
      "You have to unblock this user first to send him a friend request",
      400,
      httpStatusText.FAIL
    );
    return { error, type: "error" };
  }

  if (sender.friendList.length + sender.friendRequests.length >= 500) {
    const error = new AppError(
      "You can't send a friend request to this user as your friend list is full",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  if (recipient.friendList.length + recipient.friendRequests.length >= 500) {
    const error = new AppError(
      "The user you are trying to send a friend request to has a full friend list",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const requestAlreadyExist = recipient.friendRequests.findIndex(
    (request) => request.sender.toString() === senderId
  );
  if (requestAlreadyExist !== -1) {
    const requestAlreadyAccepted =
      recipient.friendRequests[requestAlreadyExist].status === "accepted";
    if (requestAlreadyAccepted) {
      const error = new AppError(
        "You are already a friend to this user",
        400,
        httpStatusText.ERROR
      );
      return { error, type: "error" };
    }
    const error = new AppError(
      "You already sent a friend request to this user",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  sender.sentFriendRequests.push({ sentTo: recipient._id, status: "pending" });
  recipient.friendRequests.push({ sender: sender._id, status: "pending" });
  await sender.save();
  await recipient.save();
  return { type: "success" };
};

const updateFriendRequestStatusService = async (
  recpientId: string,
  friendRequest: IFriendRequest
): Promise<TServiceResult<IUser>> => {
  const recpient = await User.findById(recpientId);
  const sender = await User.findById(friendRequest.sender);

  if (!recpient) {
    const error = new AppError(
      "Invalid friend request recpient id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  if (!sender) {
    const error = new AppError(
      "Invalid friend request sender id",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const currentFriendRequestIndex = recpient.friendRequests.findIndex(
    (request) => request.sender.toString() === friendRequest.sender.toString()
  );
  const currentSentFriendRequestIndex = sender.sentFriendRequests.findIndex(
    (sentRequest) => sentRequest.sentTo.toString() === recpientId
  );

  // Checking if the request is already accpeted or declined
  const currentFriendRequestStatus =
    sender.sentFriendRequests[currentSentFriendRequestIndex].status;
  if (currentFriendRequestStatus === "accepted") {
    const error = new AppError(
      "This request is already accepted",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  } else if (currentFriendRequestStatus === "declined") {
    const error = new AppError(
      "This request is already declined",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  if (friendRequest.status === "accepted") {
    recpient.friendRequests[currentFriendRequestIndex].status = "accepted";
    sender.sentFriendRequests[currentSentFriendRequestIndex].status =
      "accepted";

    recpient.friendList.push(friendRequest.sender);
    sender.friendList.push(recpient._id);
  } else {
    recpient.friendRequests[currentFriendRequestIndex].status = "declined";
    sender.sentFriendRequests[currentSentFriendRequestIndex].status =
      "declined";
  }

  await recpient.save();
  await sender.save();
  return { type: "success" };
};

const addToBlockListService = async (
  userId: string,
  blockedUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  const blockedUser = await User.findById(blockedUserId);

  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  if (!blockedUser) {
    const error = new AppError(
      "Invalid user id to be blocked",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  user.blockList.push(blockedUserId);

  const userToBlockIsFriend = user.friendList.find(
    (friend) => friend.toString() === blockedUserId.toString()
  );
  if (userToBlockIsFriend) {
    user.friendList = user.friendList.filter(
      (friend) => friend.toString() !== blockedUserId.toString()
    );

    blockedUser.friendList = blockedUser.friendList.filter(
      (friend) => friend.toString() !== userId
    );

    // Checking who sent the request to the other to remove the requests from both users
    // This is for the case of unblock and sending friend requests again
    const blockedUserSentTheRequest = blockedUser.sentFriendRequests.findIndex(
      (sentRequest) => sentRequest.sentTo.toString() === userId
    );
    if (blockedUserSentTheRequest !== -1) {
      blockedUser.sentFriendRequests = blockedUser.sentFriendRequests.filter(
        (sentRequest) => sentRequest.sentTo.toString() !== userId
      );
      user.friendRequests = user.friendRequests.filter(
        (request) => request.sender.toString() !== blockedUserId.toString()
      );
    } else {
      blockedUser.friendRequests = blockedUser.friendRequests.filter(
        (request) => request.sender.toString() !== userId
      );
      user.sentFriendRequests = user.sentFriendRequests.filter(
        (sentRequest) =>
          sentRequest.sentTo.toString() !== blockedUserId.toString()
      );
    }
    await blockedUser.save();
  }

  await user.save();
  return { type: "success" };
};

const removeFromBlockListService = async (
  userId: string,
  blockedUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<IUser>> => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const isUserActullayblocked = user.blockList.findIndex(
    (blockedUser) => blockedUser.toString() === blockedUserId.toString()
  );

  if (isUserActullayblocked !== -1) {
    user.blockList.splice(isUserActullayblocked, 1);
  } else {
    const error = new AppError(
      "This user is not in your block list",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  user.blockList = user.blockList.filter(
    (blockedUser) => blockedUser.toString() !== blockedUserId.toString()
  );
  await user.save();
  return { type: "success" };
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
  addFriendRequestService,
  updateFriendRequestStatusService,
  addToBlockListService,
  removeFromBlockListService,
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
