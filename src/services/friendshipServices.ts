import { FriendRequest, Friendship, User } from "../models";
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
  recpientId: string,
  friendRequest: any
) => {
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

export default {
  sendFriendRequestService,
  updateFriendRequestStatusService,
};
