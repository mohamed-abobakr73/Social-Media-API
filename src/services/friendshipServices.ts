import { FriendRequest, Friendship, User } from "../models";
import { TFriendRequestStatus } from "../types";
import AppError from "../utils/AppError";
import doesResourceExists from "../utils/doesResourceExists";
import httpStatusText from "../utils/httpStatusText";

const checkUserFriendListLength = async (userId: string, message: string) => {
  const userFriendListLength = await Friendship.countDocuments({
    user: userId,
  });
  if (userFriendListLength >= 500) {
    const error = new AppError(message, 400, httpStatusText.ERROR);
    throw error;
  }
};

const checkFriendRequestStatus = (status: string) => {
  if (status !== "pending") {
    const error = new AppError(
      "This friend request is already accepted or declined",
      400,
      httpStatusText.FAIL
    );
    throw error;
  }
};

const canUserUpdateFriendRequest = (
  friendRequestSentTo: string,
  userId: string
) => {
  if (friendRequestSentTo !== userId) {
    const error = new AppError(
      "You are not authorized to update this friend request",
      401,
      httpStatusText.FAIL
    );
    throw error;
  }
};

const getFriendRequestsService = async (userId: string) => {
  const user = await User.findById(userId);

  doesResourceExists(user, "You are not authorized to get friend requests");

  const friendRequests = await FriendRequest.find(
    { sentTo: userId, status: { $ne: "accepted" } },
    { __v: 0, sentTo: 0 }
  ).populate("sender", "username profilePicture");

  return friendRequests;
};

const createFriendshipService = async (userId: string, friendId: string) => {
  const friendship = await Friendship.create({
    user: userId,
    friend: friendId,
  });

  doesResourceExists(friendship, "Error creating friendship");

  return friendship;
};

const sendFriendRequestService = async (
  senderId: string,
  recipientId: string
) => {
  const sender = await User.findById(senderId);
  const recipient = await User.findById(recipientId);

  doesResourceExists(sender, "You are not authorized to send a friend request");

  doesResourceExists(recipient, "Invalid friend request recipient id");

  // Checking if any of the users blocked the other
  // const isUserBlocked = recipient.blockList.find(
  //   (blocked) => blocked.toString() === senderId
  // );
  // const senderBlockedTheRecpient = sender.blockList.find(
  //   (blocked) => blocked.toString() === recipientId
  // );

  // if (isUserBlocked) {
  //   const error = new AppError(
  //     "You can't send a friend request to this user",
  //     400,
  //     httpStatusText.FAIL
  //   );
  //   return { error, type: "error" };
  // }

  // if (senderBlockedTheRecpient) {
  //   const error = new AppError(
  //     "You have to unblock this user first to send him a friend request",
  //     400,
  //     httpStatusText.FAIL
  //   );
  //   return { error, type: "error" };
  // }

  await checkUserFriendListLength(
    senderId,
    "You have reached the maximum number of friends"
  );
  await checkUserFriendListLength(
    recipientId,
    "You can't send a friend request to this user as his friend list is full"
  );

  const friendRequest = new FriendRequest({
    sender: senderId,
    sentTo: recipientId,
  });

  await friendRequest.save();
};

const updateFriendRequestStatusService = async (
  userId: string,
  friendRequestUpdate: { friendRequestId: string; status: TFriendRequestStatus }
) => {
  const user = await User.findById(userId);

  doesResourceExists(user, "You are not authorized to update a friend request");

  const { friendRequestId, status } = friendRequestUpdate;

  const friendRequest = await FriendRequest.findById(friendRequestId);

  doesResourceExists(friendRequest, "Invalid friend request id");

  canUserUpdateFriendRequest(friendRequest.sentTo.toString(), userId);

  checkFriendRequestStatus(friendRequest.status);

  await FriendRequest.updateOne({ _id: friendRequest._id }, { status });

  switch (status) {
    case "accepted":
      await createFriendshipService(userId, friendRequest.sender.toString());
      break;
    case "declined":
      break;
  }
};

export default {
  getFriendRequestsService,
  sendFriendRequestService,
  updateFriendRequestStatusService,
};
