import { Block, FriendRequest, Friendship, User } from "../models";
import doesResourceExists from "../utils/doesResourceExists";
import assertUserIsAllowed from "../utils/assertUserIsAllowed";
import httpStatusText from "../utils/httpStatusText";

const removeFriendshipAfterBlock = async (
  userId: string,
  userToBlockId: string
) => {
  await Friendship.deleteOne({
    $or: [
      { user: userId, friend: userToBlockId },
      { user: userToBlockId, friend: userId },
    ],
  });

  await FriendRequest.deleteOne({
    $or: [
      { sender: userId, sentTo: userToBlockId },
      { sentTo: userToBlockId, sender: userId },
    ],
  });
};

const blockUserService = async (userId: string, userToBlockId: string) => {
  const user = await User.findById(userId);
  const blockedUser = await User.findById(userToBlockId);

  doesResourceExists(
    user,
    "You are not authorized to block a user",
    401,
    httpStatusText.FAIL
  );
  doesResourceExists(
    blockedUser,
    "Invalid user id to be blocked",
    400,
    httpStatusText.FAIL
  );

  const blockUser = new Block({
    user: user._id,
    blockedUser: blockedUser._id,
  });

  doesResourceExists(
    blockUser,
    "Error blocking user",
    400,
    httpStatusText.FAIL
  );

  await removeFriendshipAfterBlock(userId, userToBlockId);

  await blockUser.save();
};

const deleteBlockService = async (userId: string, blockId: string) => {
  const user = await User.findById(userId);

  doesResourceExists(
    user,
    "You are not authorized to unblock a user",
    401,
    httpStatusText.FAIL
  );

  const block = await Block.findById(blockId);

  doesResourceExists(block, "Invalid block id", 400, httpStatusText.FAIL);

  assertUserIsAllowed(block.user.toString(), userId);

  const deleteResult = await Block.deleteOne({
    _id: blockId,
  });

  doesResourceExists(
    deleteResult.deletedCount,
    "Error unblocking user",
    400,
    httpStatusText.FAIL
  );
};

export default {
  blockUserService,
  deleteBlockService,
};
