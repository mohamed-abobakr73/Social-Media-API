import mongoose from "mongoose";
import { Group } from "../models/groupsModel";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import { TServiceResult } from "../types/serviceResult";
import { User } from "../models/usersModel";
import notificationsServices from "./notificationsServices";
import { TGroup, TPaginationData, TStatus } from "../types";
import paginationResult from "../utils/paginationResult";
import doesResourceExists from "../utils/doesResourceExists";
import { GroupJoinRequests, GroupMembership } from "../models";
import assertUserIsAllowed from "../utils/assertUserIsAllowed";

const addGroupMembership = async (
  groupId: string,
  userId: string,
  role: "admin" | "member" = "member"
) => {
  const membership = new GroupMembership({
    group: groupId,
    user: userId,
    role,
  });
  await membership.save();
};

const removeGroupMembership = async (groupId: string, userId: string) => {
  const deleteResult = await GroupMembership.deleteOne({
    group: groupId,
    user: userId,
  });

  doesResourceExists(
    deleteResult.deletedCount,
    "You are not a member of this group"
  );
};

const addGroupJoinRequest = async (groupId: string, userId: string) => {
  const joinRequest = new GroupJoinRequests({
    group: groupId,
    user: userId,
  });
  await joinRequest.save();
};

const removeGroupJoinRequest = async (groupId: string, userId: string) => {
  await GroupJoinRequests.deleteOne({
    group: groupId,
    user: userId,
  });
};

const checkIfUserAlreadyMember = async (groupId: string, userId: string) => {
  const userAlreadyMember = await GroupMembership.findOne({
    group: groupId,
    user: userId,
  });

  doesResourceExists(
    !userAlreadyMember,
    "You are already a member in this group"
  );
};

const checkIfUserMadeJoinRequest = async (groupId: string, userId: string) => {
  const userAlreadyMadeRequest = await GroupJoinRequests.findOne({
    group: groupId,
    user: userId,
  });

  doesResourceExists(
    !userAlreadyMadeRequest,
    "You have already made a join request to this group"
  );
};

const checkCurrentJoinRequestStatus = (joinRequestStatus: string) => {
  if (joinRequestStatus !== "pending") {
    const error = new AppError(
      "This request has already been handled",
      400,
      httpStatusText.ERROR
    );
    throw error;
  }
};

const checkCurrentUserRoleInGroup = async (groupId: string, userId: string) => {
  const currentUserRole = await GroupMembership.findOne(
    {
      group: groupId,
      user: userId,
    },
    { role: 1 }
  );

  doesResourceExists(
    currentUserRole,
    "You are not authorized to handle a join request"
  );

  assertUserIsAllowed(
    "admin",
    currentUserRole.role,
    "You are not authorized to handle a join request"
  );
};

const checkGroupPrivacy = (groupPrivacy: boolean) => {
  if (!groupPrivacy) {
    const error = new AppError(
      "This group is not private",
      400,
      httpStatusText.ERROR
    );
    throw error;
  }
};

const checkIfUserIsGroupOwner = (groupOwnerId: string, userId: string) => {
  if (groupOwnerId === userId) {
    const error = new AppError(
      "Group owner can't leave the group",
      400,
      httpStatusText.ERROR
    );
    throw error;
  }
};

const getAllGroupsService = async (paginationData: TPaginationData) => {
  const { limit, skip } = paginationData;
  const groups = await Group.find({}, { __v: 0 }).limit(limit).skip(skip);

  const totalCount = await Group.countDocuments();

  const paginationInfo = paginationResult(totalCount, skip, limit);

  return { groups, paginationInfo };
};

const getGroupByIdService = async (groupId: string) => {
  const group = await Group.findById(groupId, {
    __v: 0,
    reports: 0,
    isDeleted: 0,
    joinRequests: 0,
    banned: 0,
  });

  doesResourceExists(group, "Group not found");

  return group;
};

const getJoinRequestsService = async (
  userId: string,
  groupId: string,
  paginationData: TPaginationData,
  status?: TStatus
) => {
  const user = await User.findById(userId);
  const group = await Group.findById(groupId);

  doesResourceExists(user, "You are not authorized to do this action");
  doesResourceExists(group, "Group not found");

  await checkCurrentUserRoleInGroup(groupId, userId);

  checkGroupPrivacy(group.isPrivate);

  const { limit, skip } = paginationData;

  const filter: { group: string; status?: string } = { group: groupId };

  if (status) {
    filter.status = status;
  }

  const joinRequests = await GroupJoinRequests.find(filter, {
    user: 1,
    status: 1,
    respondedBy: 1,
  })
    .populate("user", "username profilePicture")
    .skip(skip)
    .limit(limit);

  const totalCount = await GroupJoinRequests.countDocuments({ group: groupId });

  const paginationInfo = paginationResult(totalCount, skip, limit);

  return { joinRequests, paginationInfo };
};

const getGroupMembersService = async (
  groupId: string,
  paginationData: TPaginationData
) => {
  const { limit, skip } = paginationData;
  const groupMembers = await GroupMembership.find(
    { group: groupId },
    { user: 1, role: 1 }
  )
    .populate("user", "username profilePicture")
    .skip(skip)
    .limit(limit);

  const totalCount = await GroupMembership.countDocuments({ group: groupId });

  const paginationInfo = paginationResult(totalCount, skip, limit);

  return { groupMembers, paginationInfo };
};

const createGroupService = async (
  userId: string,
  groupData: {
    groupName: string;
    createdBy: mongoose.Types.ObjectId;
    isPrivate?: string;
    groupCover?: string;
  }
) => {
  const user = await User.findById(userId);

  doesResourceExists(user, "You are not authorized to create a group");

  const { groupName, isPrivate, groupCover } = groupData;

  const group = new Group({
    groupName,
    createdBy: userId,
    isPrivate,
    groupCover: groupCover || "",
  });

  await addGroupMembership(group._id.toString(), userId, "admin");

  await group.save();

  return group;
};

// TODO removed any join requests in case of the change from private to public, fix the image and things like that
const updateGroupService = async (
  groupId: string,
  userId: string,
  updateData: {
    groupName: string;
    isPrivate?: string;
    groupCover?: string;
  }
): Promise<TServiceResult<TGroup>> => {
  const { groupCover, isPrivate } = updateData;
  const user = await User.findById(userId);
  const group = await Group.findById(groupId);

  if (!group) {
    const error = new AppError("Invalid group id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userIsGroupOwner = group.createdBy.toString() === userId;
  if (!userIsGroupOwner) {
    const error = new AppError(
      "Only group owner can delete this group",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  if (group.isDeleted) {
    const error = new AppError(
      "This group is deleted, you can't update it",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const updatedGroup = await Group.findByIdAndUpdate(
    groupId,
    {
      $set: {
        ...updateData,
        isPrivate: isPrivate || group.isPrivate,
        groupCover: groupCover || group.groupCover,
      },
    },
    { new: true }
  );

  if (!updatedGroup) {
    const error = new AppError(
      "An error occured during updating the group, please try again later",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  return { data: updatedGroup, type: "success" };
};

// TODO check what is better to totally delete or just fill the isDeleted
const deleteGroupService = async (
  groupId: string,
  userId: string
): Promise<TServiceResult<TGroup>> => {
  const user = await User.findById(userId);
  const group = await Group.findById(groupId);

  if (!group) {
    const error = new AppError("Invalid group id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }
  if (!user) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  const userIsGroupOwner = group.createdBy.toString() === userId;
  if (!userIsGroupOwner) {
    const error = new AppError(
      "Only group owner can delete this group",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  group.isDeleted = true;
  await group.save();
  return { type: "success" };
};

// TODO check the notification thing
const joinGroupService = async (
  userId: string,
  groupId: string
  // notifications: boolean
) => {
  const user = await User.findById(userId);
  const group = await Group.findById(groupId);

  doesResourceExists(user, "You are not authorized to join a group");
  doesResourceExists(group, "Group not found");

  const stringifiedGroupId: string = group._id.toString();

  await checkIfUserAlreadyMember(stringifiedGroupId, userId);

  let joinStatus: string;

  if (group.isPrivate) {
    await checkIfUserMadeJoinRequest(stringifiedGroupId, userId);

    await addGroupJoinRequest(stringifiedGroupId, userId);

    joinStatus = "pending";
  } else {
    await addGroupMembership(stringifiedGroupId, userId);

    joinStatus = "joined";
  }

  return joinStatus;
};

const cancelJoinGroupRequestService = async (
  userId: string,
  joinRequestId: string
) => {
  const user = await User.findById(userId);

  doesResourceExists(user, "You are not authorized to cancel a join request");

  const joinRequest = await GroupJoinRequests.findOne({
    _id: joinRequestId,
  });

  doesResourceExists(joinRequest, "Request not found");

  assertUserIsAllowed(
    joinRequest.user.toString(),
    userId,
    "You are not authorized to cancel this join request"
  );

  await GroupJoinRequests.deleteOne({
    _id: joinRequest._id,
  });
};

const handleJoinRequestsService = async (
  userId: string,
  joinRequestId: string,
  status: TStatus
) => {
  const user = await User.findById(userId);

  doesResourceExists(user, "You are not authorized to handle a join request");

  const joinRequest = await GroupJoinRequests.findOne({
    _id: joinRequestId,
  });

  doesResourceExists(joinRequest, "Request not found");

  checkCurrentJoinRequestStatus(joinRequest.status);

  checkCurrentUserRoleInGroup(joinRequest.group.toString(), userId);

  switch (status) {
    case "accepted":
      await addGroupMembership(
        joinRequest.group.toString(),
        user._id.toString()
      );
      break;
    case "declined":
      break;
  }

  joinRequest.status = status;
  joinRequest.respondedBy = user._id;

  await joinRequest.save();
};

const leaveGroupService = async (userId: string, groupId: string) => {
  const user = await User.findById(userId);
  const group = await Group.findById(groupId);

  doesResourceExists(user, "You are not authorized to leave a group");
  doesResourceExists(group, "Group not found");

  checkIfUserIsGroupOwner(group.createdBy.toString(), userId);

  await removeGroupMembership(groupId, userId);

  await removeGroupJoinRequest(groupId, userId);
};

export default {
  getAllGroupsService,
  getGroupByIdService,
  getGroupMembersService,
  getJoinRequestsService,
  createGroupService,
  updateGroupService,
  deleteGroupService,
  joinGroupService,
  cancelJoinGroupRequestService,
  handleJoinRequestsService,
  leaveGroupService,
};
