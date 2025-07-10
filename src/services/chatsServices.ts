import mongoose from "mongoose";
import { Chat, User } from "../models/";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import { TServiceResult } from "../types/serviceResult";
import { TChat, TPaginationData } from "../types";
import paginationResult from "../utils/paginationResult";

const getAllChatsService = async (
  userId: string,
  pagination: TPaginationData
) => {
  const { limit, skip } = pagination;

  const chats = await Chat.find(
    { participants: { $all: [userId] } },
    { __v: 0 }
  )
    .limit(limit)
    .skip(skip);

  const totalCount = await Chat.countDocuments({
    participants: { $all: [userId] },
  });

  const paginationInfo = paginationResult(totalCount, skip, limit);

  return { chats, paginationInfo };
};

const createChatService = async (firstUserId: string, secondUserId: string) => {
  const chat = new Chat({
    participants: [firstUserId, secondUserId],
  });

  await chat.save();
  return chat;
};

const sendMessageService = async (
  chatId: string,
  senderId: string,
  content: string
) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    const error = new AppError("Invalid chat id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  // Ensure the sender is a participant
  const senderIsParticipant = chat.participants.find(
    (participant) => participant.toString() === senderId
  );
  if (!senderIsParticipant) {
    const error = new AppError(
      "Sender is not a participant in this chat",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const message = {
    _id: new mongoose.Types.ObjectId(),
    sender: senderIsParticipant,
    content,
    seen: false,
  };
  // chat.messages.push(message);
  await chat.save();
  // return { data: message, type: "success" };
};

const updateOrDeleteMessageService = async (
  chatId: string,
  messageData: {
    type: "update" | "delete";
    senderId: string;
    messageId: string;
    newContent?: string;
  }
): Promise<TServiceResult<TChat>> => {
  const { type, senderId, messageId, newContent } = messageData;
  const chat = await Chat.findById(chatId);
  if (!chat) {
    const error = new AppError("Invalid chat id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  // Ensure the sender is a participant
  const senderIsParticipant = chat.participants.find(
    (participant) => participant.toString() === senderId
  );
  if (!senderIsParticipant) {
    const error = new AppError(
      "Sender is not a participant in this chat",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // const messageIndex = chat.messages.findIndex(
  //   (message) => message._id!.toString() === messageId
  // );

  // const message = chat.messages[messageIndex];
  // if (!message) {
  //   const error = new AppError("Invalid message id", 400, httpStatusText.ERROR);
  //   return { error, type: "error" };
  // }

  // if (message.sender.toString() !== senderId) {
  //   const error = new AppError(
  //     "User is not message sender",
  //     400,
  //     httpStatusText.ERROR
  //   );
  //   return { error, type: "error" };
  // }

  switch (type) {
    case "update":
      // chat.messages[messageIndex].content = newContent!;
      await chat.save();
      break;
    case "delete":
      // chat.messages.splice(messageIndex, 1);
      await chat.save();
      break;
  }

  return { type: "success" };
};

export default {
  createChatService,
  getAllChatsService,
  sendMessageService,
  updateOrDeleteMessageService,
};
