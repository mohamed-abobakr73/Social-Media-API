import { Block, FriendRequest, Friendship, User } from "../models";
import { TStatus } from "../types";
import AppError from "../utils/AppError";
import assertUserIsAllowed from "../utils/assertUserIsAllowed";
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

const checkIfBlockedRelationshipExists = async (
  senderId: string,
  recipientId: string
) => {
  const isUserBlocked = await Block.findOne({
    $or: [
      { user: senderId, blockedUser: recipientId },
      { user: recipientId, blockedUser: senderId },
    ],
  });

  doesResourceExists(
    !isUserBlocked,
    "You can't send a friend request to this user",
    400,
    httpStatusText.FAIL
  );
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

const isPartOfFriendship = (
  friendship: { user: string; friend: string },
  userId: string
) => {
  const { user, friend } = friendship;
  const isPartOfFriendship = user === userId || friend === userId;

  if (!isPartOfFriendship) {
    const error = new AppError(
      "You are not authorized to remove this friendship",
      401,
      httpStatusText.FAIL
    );
    throw error;
  }
};

const getFriendRequestsService = async (
  userId: string,
  type: "sent" | "received"
) => {
  const user = await User.findById(userId);
  doesResourceExists(
    user,
    "You are not authorized to get friend requests",
    401,
    httpStatusText.FAIL
  );
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

  doesResourceExists(
    friendship,
    "Error creating friendship",
    400,
    httpStatusText.FAIL
  );

  return friendship;
};

const sendFriendRequestService = async (
  senderId: string,
  recipientId: string
) => {
  const sender = await User.findById(senderId);
  const recipient = await User.findById(recipientId);

  preventSelfFriendRequest(senderId, recipientId);

  doesResourceExists(
    sender,
    "You are not authorized to send a friend request",
    401,
    httpStatusText.FAIL
  );

  doesResourceExists(
    recipient,
    "Invalid friend request recipient id",
    400,
    httpStatusText.FAIL
  );

  await checkIfBlockedRelationshipExists(senderId, recipientId);

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
  friendRequestUpdate: { friendRequestId: string; status: TStatus }
) => {
  const user = await User.findById(userId);

  doesResourceExists(
    user,
    "You are not authorized to update a friend request",
    401,
    httpStatusText.FAIL
  );

  const { friendRequestId, status } = friendRequestUpdate;

  const friendRequest = await FriendRequest.findById(friendRequestId);

  doesResourceExists(
    friendRequest,
    "Invalid friend request id",
    400,
    httpStatusText.FAIL
  );

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

  doesResourceExists(
    user,
    "You are not authorized to cancel a friend request",
    401,
    httpStatusText.FAIL
  );

  const friendRequest = await FriendRequest.findById(friendRequestId);

  doesResourceExists(friendRequest, "Friend request not found");

  assertUserIsAllowed(friendRequest.sender.toString(), userId);

  const deleteResult = await FriendRequest.deleteOne({
    _id: friendRequest._id,
  });

  doesResourceExists(
    deleteResult.deletedCount,
    "Error canceling friend request",
    400,
    httpStatusText.FAIL
  );
};

const getFriendshipsService = async (userId: string) => {
  const user = await User.findById(userId);

  doesResourceExists(
    user,
    "You are not authorized to get a friendship",
    401,
    httpStatusText.FAIL
  );

  const friendships = await Friendship.find({
    $or: [{ user: userId }, { friend: userId }],
  });

  return friendships;
};

const deleteFriendshipService = async (
  userId: string,
  friendshipId: string
) => {
  const user = await User.findById(userId);

  doesResourceExists(
    user,
    "You are not authorized to remove a friendship",
    401,
    httpStatusText.FAIL
  );

  const friendship = await Friendship.findById(friendshipId);

  doesResourceExists(
    friendship,
    "Invalid friendship id",
    400,
    httpStatusText.FAIL
  );

  isPartOfFriendship(
    { user: friendship.user.toString(), friend: friendship.friend.toString() },
    userId
  );

  const deleteResult = await Friendship.deleteOne({ _id: friendship._id });

  doesResourceExists(
    deleteResult.deletedCount,
    "Error removing friendship",
    400,
    httpStatusText.FAIL
  );
};

export default {
  getFriendRequestsService,
  sendFriendRequestService,
  updateFriendRequestStatusService,
  cancelFriendRequestService,
  getFriendshipsService,
  deleteFriendshipService,
};
