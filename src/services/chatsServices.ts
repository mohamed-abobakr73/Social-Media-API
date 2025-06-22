import mongoose from "mongoose";
import { Chat, User } from "../models/";
import AppError from "../utils/AppError";
import httpStatusText from "../utils/httpStatusText";
import { TServiceResult } from "../types/serviceResult";
import { TChat, TMessage } from "../types";

const getAllChatsService = async (
  userId: string
): Promise<TServiceResult<TChat[]>> => {
  const chats = await Chat.find(
    { participants: { $all: [userId] } },
    { __v: 0 }
  );
  if (!chats) {
    const error = new AppError("Invalid user id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  return { data: chats, type: "success" };
};

const createOrGetChatService = async (
  firstUserId: mongoose.Types.ObjectId,
  secondUserId: mongoose.Types.ObjectId
): Promise<TServiceResult<TChat>> => {
  // Ensure participants exist and aren't blocked
  const users = await User.find({ _id: { $in: [firstUserId, secondUserId] } });

  if (users.length !== 2) {
    const error = new AppError(
      "Invalid paricipants ids",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  const isBlocked = users.some(
    (user) =>
      user.blockList.includes(firstUserId) ||
      user.blockList.includes(secondUserId)
  );

  if (isBlocked) {
    const error = new AppError(
      "Cannot chat with a blocked user",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  // Check if chat already exists
  const existingChat = await Chat.findOne({
    participants: { $all: [firstUserId, secondUserId] },
  });
  if (existingChat) {
    return { data: existingChat, type: "success" };
  }

  // Create a new chat
  const newChat = new Chat({
    participants: [firstUserId, secondUserId],
    messages: [],
  });
  await newChat.save();

  // Add the chat to each user Chats property
  users.forEach(async (user) => {
    user.chats.push(newChat._id);
    await user.save();
  });
  return { data: newChat, type: "success" };
};

const sendMessageService = async (
  chatId: string,
  senderId: string,
  content: string
): Promise<TServiceResult<TMessage>> => {
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
  chat.messages.push(message);
  await chat.save();
  return { data: message, type: "success" };
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

  const messageIndex = chat.messages.findIndex(
    (message) => message._id!.toString() === messageId
  );

  const message = chat.messages[messageIndex];
  if (!message) {
    const error = new AppError("Invalid message id", 400, httpStatusText.ERROR);
    return { error, type: "error" };
  }

  if (message.sender.toString() !== senderId) {
    const error = new AppError(
      "User is not message sender",
      400,
      httpStatusText.ERROR
    );
    return { error, type: "error" };
  }

  switch (type) {
    case "update":
      chat.messages[messageIndex].content = newContent!;
      await chat.save();
      break;
    case "delete":
      chat.messages.splice(messageIndex, 1);
      await chat.save();
      break;
  }

  return { type: "success" };
};

export default {
  createOrGetChatService,
  getAllChatsService,
  sendMessageService,
  updateOrDeleteMessageService,
};
