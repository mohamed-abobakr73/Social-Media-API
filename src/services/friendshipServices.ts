import { FriendRequest, Friendship, User } from "../models";
import { TFriendRequestStatus } from "../types";
import AppError from "../utils/AppError";
import doesResourceExists from "../utils/doesResourceExists";
import httpStatusText from "../utils/httpStatusText";

const preventSelfFriendRequest = (senderId: string, recipientId: string) => {
  if (senderId === recipientId) {
    const error = new AppError(
      "You can't send a friend request to yourself",
      400,
      httpStatusText.FAIL
    );
    throw error;
  }
};

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

const assertUserIsAllowed = (
  resourceOwnerId: string,
  currentUserId: string,
  message: string = "You are not authorized to perform this action."
): void => {
  if (resourceOwnerId !== currentUserId) {
    const error = new AppError(message, 401, httpStatusText.FAIL);
    throw error;
  }
};

const getFriendRequestsService = async (
  userId: string,
  type: "sent" | "received"
) => {
  const user = await User.findById(userId);
  doesResourceExists(user, "You are not authorized to get friend requests");
  let query;
  let projection;
  let populatedField;

  switch (type) {
    case "sent":
      query = { sender: userId, status: { $ne: "accepted" } };
      projection = { __v: 0, sender: 0 };
      populatedField = {
        path: "sentTo",
        select: "username profilePicture",
      };
      break;
    case "received":
      query = { sentTo: userId, status: { $ne: "accepted" } };
      projection = { __v: 0, sentTo: 0 };
      populatedField = {
        path: "sender",
        select: "username profilePicture",
      };
      break;
    default:
      const error = new AppError("Invalid type", 400, httpStatusText.ERROR);
      throw error;
  }

  const friendRequests = await FriendRequest.find(query, projection).populate(
    populatedField
  );

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

// Check for the blocks
const sendFriendRequestService = async (
  senderId: string,
  recipientId: string
) => {
  const sender = await User.findById(senderId);
  const recipient = await User.findById(recipientId);

  preventSelfFriendRequest(senderId, recipientId);

  doesResourceExists(sender, "You are not authorized to send a friend request");

  doesResourceExists(recipient, "Invalid friend request recipient id");

  // Checking if any of the users blocked the other
  // const isUserBlocked = recipient.blockList.find(
  //   (blocked) => blocked.toString() === senderId
  // );
  // const senderBlockedTheRecipient = sender.blockList.find(
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

  // if (senderBlockedTheRecipient) {
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

// TODO create chat after acceptance
const updateFriendRequestStatusService = async (
  userId: string,
  friendRequestUpdate: { friendRequestId: string; status: TFriendRequestStatus }
) => {
  const user = await User.findById(userId);

  doesResourceExists(user, "You are not authorized to update a friend request");

  const { friendRequestId, status } = friendRequestUpdate;

  const friendRequest = await FriendRequest.findById(friendRequestId);

  doesResourceExists(friendRequest, "Invalid friend request id");

  assertUserIsAllowed(friendRequest.sentTo.toString(), userId);

  checkFriendRequestStatus(friendRequest.status);

  switch (status) {
    case "accepted":
      await createFriendshipService(userId, friendRequest.sender.toString());
      break;
    case "declined":
      break;
  }

  await FriendRequest.deleteOne({ _id: friendRequest._id });
};

const cancelFriendRequestService = async (
  userId: string,
  friendRequestId: string
) => {
  const user = await User.findById(userId);

  doesResourceExists(user, "You are not authorized to cancel a friend request");

  const friendRequest = await FriendRequest.findById(friendRequestId);

  doesResourceExists(friendRequest, "Friend request not found");

  assertUserIsAllowed(friendRequest.sender.toString(), userId);

  const deleteResult = await FriendRequest.deleteOne({
    _id: friendRequest._id,
  });

  doesResourceExists(
    deleteResult.deletedCount,
    "Error canceling friend request"
  );
};

const deleteFriendshipService = async (
  userId: string,
  friendshipId: string
) => {
  const user = await User.findById(userId);

  doesResourceExists(user, "You are not authorized to remove a friendship");

  const friendship = await Friendship.findById(friendshipId);

  doesResourceExists(friendship, "Invalid friendship id");

  assertUserIsAllowed(friendship.user.toString(), userId);
  assertUserIsAllowed(friendship.friend.toString(), userId);

  const deleteResult = await Friendship.deleteOne({ _id: friendship._id });

  doesResourceExists(deleteResult.deletedCount, "Error removing friendship");
};

export default {
  getFriendRequestsService,
  sendFriendRequestService,
  updateFriendRequestStatusService,
  cancelFriendRequestService,
  deleteFriendshipService,
};
