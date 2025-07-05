import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import usersServices from "../services/usersServices";
import httpStatusText from "../utils/httpStatusText";

const getAllUsers = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const users = await usersServices.getAllUsersService();

    return res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, data: { users } });
  }
);

const getUserById = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;

    const user = await usersServices.getUserByIdService(userId);

    return res
      .status(200)
      .json({ status: httpStatusText.SUCCESS, data: { user } });
  }
);

const createUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const uploadedImage = req.file?.path;

    const userData = {
      ...req.body,
      profilePicture: uploadedImage,
    };

    const { user, token } = await usersServices.createUserService(userData);

    return res.status(201).json({
      status: httpStatusText.SUCCESS,
      data: { user, token: token },
    });
  }
);

const login = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { user, token } = await usersServices.loginService(req.body);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { user, token },
    });
  }
);

const updateUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;

    const user = await usersServices.updateUserService(userId, req.body);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { user },
    });
  }
);

const deleteUser = asyncWrapper(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.currentUser!;

    await usersServices.deleteUserService(userId);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: { message: "User deleted successfully" },
    });
  }
);

export { getAllUsers, getUserById, createUser, login, updateUser, deleteUser };
