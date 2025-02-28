import { Router } from "express";
import {
  createOrGetChat,
  getAllChats,
  sendMessage,
  updateOrDeleteMessage,
} from "../controllers/chatsController";
import createChatValidation from "../middlewares/createChatValidation";
import userIdValidation from "../middlewares/userIdValidation";
import sendMessageValidation from "../middlewares/sendMessageValidation";
import updateOrDeleteMessageValidation from "../middlewares/updateOrDeleteMessageValidation";

const chatsRouter = Router();

// Get all chats by user id
chatsRouter.route("/").get(getAllChats);

// Create or get chat if it already exists
chatsRouter.route("/").post(createChatValidation(), createOrGetChat);

// Send message
chatsRouter.route("/:chatId").post(sendMessageValidation(), sendMessage);

// Update or delete message
chatsRouter
  .route("/:chatId")
  .patch(updateOrDeleteMessageValidation(), updateOrDeleteMessage);

export default chatsRouter;
