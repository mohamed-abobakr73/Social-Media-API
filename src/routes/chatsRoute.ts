import { Router } from "express";
import {
  createOrGetChat,
  getAllChats,
  sendMessage,
  updateOrDeleteMessage,
} from "../controllers/chatsController";
import {
  createChatValidation,
  sendMessageValidation,
  updateOrDeleteMessageValidation,
  validateRequestBody,
  verifyToken,
} from "../middlewares/";

const chatsRouter = Router();

// Get all chats by user id
chatsRouter.route("/").get(verifyToken, getAllChats);

// Create or get chat if it already exists
chatsRouter
  .route("/")
  .post(createChatValidation(), validateRequestBody, createOrGetChat);

// Send message
chatsRouter
  .route("/:chatId")
  .post(sendMessageValidation(), validateRequestBody, sendMessage);

// Update or delete message
chatsRouter
  .route("/:chatId")
  .patch(
    updateOrDeleteMessageValidation(),
    validateRequestBody,
    updateOrDeleteMessage
  );

export default chatsRouter;
