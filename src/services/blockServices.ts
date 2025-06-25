import mongoose from "mongoose";
import AppError from "../utils/AppError";
import { Block, Friendship, User } from "../models";
import httpStatusText from "../utils/httpStatusText";
import doesResourceExists from "../utils/doesResourceExists";
import assertUserIsAllowed from "../utils/assertUserIsAllowed";

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
};

const blockUserService = async (userId: string, userToBlockId: string) => {
  const user = await User.findById(userId);
  const blockedUser = await User.findById(userToBlockId);

  doesResourceExists(user, "You are not authorized to block a user");
  doesResourceExists(blockedUser, "Invalid user id to be blocked");

  const blockUser = new Block({
    user: user._id,
    blockedUser: blockedUser._id,
  });

  doesResourceExists(blockUser, "Error blocking user");

  await removeFriendshipAfterBlock(userId, userToBlockId);

  await blockUser.save();
};

const deleteBlockService = async (userId: string, blockId: string) => {
  const user = await User.findById(userId);

  doesResourceExists(user, "You are not authorized to unblock a user");

  const block = await Block.findById(blockId);

  doesResourceExists(block, "Invalid block id");

  assertUserIsAllowed(block.user.toString(), userId);

  const deleteResult = await Block.deleteOne({
    _id: blockId,
  });

  doesResourceExists(deleteResult.deletedCount, "Error unblocking user");
};

export default {
  blockUserService,
  deleteBlockService,
};
