import { User } from "../models/usersModel";
import httpStatusText from "../utils/httpStatusText";
import generateJwt from "../utils/generateJwt";
import doesResourceExists from "../utils/doesResourceExists";
import hashItem from "../utils/hashItem";
import compareHashedItem from "../utils/compareHashedItem";
import { TUser } from "../types";

const createToken = (user: TUser) => {
  const { _id, username, email, role } = user;
  const tokenPayload = {
    userId: _id,
    username: username,
    email: email,
    role: role,
  };

  const token = generateJwt(tokenPayload);

  return token;
};

const getAllUsersService = async () => {
  const users = await User.find({}, { __v: 0 });
  return users;
};

const getUserByIdService = async (userId: string) => {
  const user = await User.findById(userId, { __v: 0 });

  doesResourceExists(user, "User not found");

  return user;
};

const createUserService = async (userData: Partial<TUser>) => {
  const { password } = userData;

  userData.password = hashItem(password);

  const user = new User(userData);

  await user.save();

  const token = createToken(user);

  return { user, token };
};

const loginService = async (loginData: { email: string; password: string }) => {
  const { email, password } = loginData;

  const user = await User.findOne({ email }).select("+password -__v");

  doesResourceExists(user, "Invalid credentials", 400, httpStatusText.FAIL);

  compareHashedItem(password, user.password, "Invalid credentials");

  const token = createToken(user);

  user.toObject();

  user.password = undefined as any;

  return { user, token };
};

const updateUserService = async (
  userId: string,
  updateData: Partial<TUser>
) => {
  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        ...updateData,
      },
    },
    { new: true }
  );

  doesResourceExists(user, "Error updating user", 400, httpStatusText.FAIL);

  return user;
};

const deleteUserService = async (userId: string) => {
  const deletedUser = await User.deleteOne({ _id: userId });

  doesResourceExists(
    deletedUser.deletedCount,
    "Error deleting user",
    400,
    httpStatusText.FAIL
  );
};

export default {
  getAllUsersService,
  getUserByIdService,
  createUserService,
  loginService,
  updateUserService,
  deleteUserService,
};
