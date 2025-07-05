import { User, Follower, Page } from "../models";
import { TFollowResourceType, TPaginationData } from "../types";
import assertUserIsAllowed from "../utils/assertUserIsAllowed";
import doesResourceExists from "../utils/doesResourceExists";
import httpStatusText from "../utils/httpStatusText";

const checkIfUserAlreadyFollowing = async (
  userId: string,
  resourceId: string,
  resourceType: TFollowResourceType
) => {
  const follower = await Follower.findOne({
    follower: userId,
    following: resourceId,
  });

  doesResourceExists(
    !follower,
    `You are already following this ${resourceType}`,
    400,
    httpStatusText.FAIL
  );
};

const checkIfUserFollowingHimself = async (
  userId: string,
  resourceId: string
) => {
  doesResourceExists(
    userId !== resourceId,
    "You can't follow yourself",
    400,
    httpStatusText.FAIL
  );
};

const getFollowersService = async (
  resourceId: string,
  resourceType: TFollowResourceType,
  paginationData: TPaginationData
) => {
  let followers;
  let followersCount;

  const { limit, skip } = paginationData;

  switch (resourceType) {
    case "user":
      const user = await User.findById(resourceId);
      doesResourceExists(user, "User not found");
      followers = await Follower.find({ following: user._id }, { follower: 1 })
        .limit(limit)
        .skip(skip)
        .populate("follower", { username: 1, profilePicture: 1 });
      followersCount = user.followersCount;
      break;

    case "page":
      const page = await Page.findById(resourceId);
      doesResourceExists(page, "Page not found");
      followers = await Follower.find({ following: page._id }, { follower: 1 })
        .limit(limit)
        .skip(skip)
        .populate("follower", { username: 1, profilePicture: 1 });
      followersCount = page.followersCount;
      break;
  }

  const paginationInfo = paginationResult(followersCount, skip, limit);

  return { followers, followersCount, paginationInfo };
};

const followResourceService = async (
  userId: string,
  resourceId: string,
  resourceType: TFollowResourceType
) => {
  const user = await User.findById(userId);
  doesResourceExists(
    user,
    "You are not authorized to do this action",
    401,
    httpStatusText.FAIL
  );

  await checkIfUserAlreadyFollowing(userId, resourceId, resourceType);

  checkIfUserFollowingHimself(userId, resourceId);

  let follow;

  switch (resourceType) {
    case "user":
      const userToFollow = await User.findById(resourceId);
      doesResourceExists(userToFollow, "User to follow not found");
      follow = new Follower({
        follower: user._id,
        following: userToFollow._id,
      });

      userToFollow.followersCount++;
      await userToFollow.save();
      break;

    case "page":
      const pageToFollow = await Page.findById(resourceId);
      doesResourceExists(pageToFollow, "Page to follow not found");
      follow = new Follower({
        follower: user._id,
        following: pageToFollow._id,
      });

      pageToFollow.followersCount++;
      await pageToFollow.save();
      break;
  }

  await follow.save();

  return follow;
};

const removeFollowService = async (
  userId: string,
  followId: string,
  followType: TFollowResourceType
) => {
  const user = await User.findById(userId);
  doesResourceExists(
    user,
    "You are not authorized to do this action",
    401,
    httpStatusText.FAIL
  );

  const follow = await Follower.findById(followId);
  doesResourceExists(follow, "Follow not found");

  assertUserIsAllowed(
    userId,
    follow.follower.toString(),
    "You can't do this action"
  );

  switch (followType) {
    case "user":
      const userToUnfollow = await User.findById(follow.following);
      doesResourceExists(userToUnfollow, "User to unfollow not found");
      userToUnfollow!.followersCount--;
      await userToUnfollow!.save();
      break;
    case "page":
      const pageToUnfollow = await Page.findById(follow.following);
      doesResourceExists(pageToUnfollow, "Page to unfollow not found");
      pageToUnfollow.followersCount--;
      await pageToUnfollow.save();
      break;
  }

  await Follower.deleteOne({ _id: follow._id });
};

export default {
  getFollowersService,
  followResourceService,
  removeFollowService,
};
