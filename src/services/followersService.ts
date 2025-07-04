import { User, Follower, Page } from "../models";
import { TFollowResourceType } from "../types";
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

export default { followResourceService };
