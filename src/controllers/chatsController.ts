import { Request, Response, NextFunction } from "express";
import asyncWrapper from "../middlewares/asyncWrapper";
import chatsServices from "../services/chatsServices";
import httpStatusText from "../utils/httpStatusText";
import paginationQuery from "../utils/paginationQuery";

const getAllChats = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { userId } = req.currentUser!;

    const pagination = paginationQuery(req.query);

    const chats = await chatsServices.getAllChatsService(userId, pagination);

    return res.status(200).json({
      status: httpStatusText.SUCCESS,
      data: chats,
    });
  }
);

const getChatById = asyncWrapper(async (req: Request, res: Response) => {
  const { userId } = req.currentUser!;
  const { chatId } = req.params;

  const chat = await chatsServices.getChatByIdService(chatId, userId);

  return res.status(200).json({
    status: httpStatusText.SUCCESS,
    data: chat,
  });
});

const sendMessage = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { chatId } = req.params;
    const { senderId, content } = req.body;

    const sendMessageResult = await chatsServices.sendMessageService(
      chatId,
      senderId,
      content
    );
    // if (sendMessageResult.type === "error") {
    //   return next(sendMessageResult.error);
    // } else {
    //   // io.to(chatId).emit("chat message", content);
    //   return res.status(200).json({
    //     status: httpStatusText.SUCCESS,
    //     data: { message: sendMessageResult.data },
    //   });
    // }
  }
);

const updateOrDeleteMessage = asyncWrapper(
  async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<Response | void> => {
    const { chatId } = req.params;
    const { type } = req.body;

    const updateOrDeleteMessageResult =
      await chatsServices.updateOrDeleteMessageService(chatId, req.body);
    if (updateOrDeleteMessageResult.type === "error") {
      return next(updateOrDeleteMessageResult.error);
    } else {
      return res.status(200).json({
        status: httpStatusText.SUCCESS,
        data: {
          message: `Message ${
            type === "update" ? "updated" : "deleted"
          } successfully`,
        },
      });
    }
  }
);

export { getAllChats, getChatById, sendMessage, updateOrDeleteMessage };
