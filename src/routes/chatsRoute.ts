import { Router } from "express";
import {
  getAllChats,
  getChatById,
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

chatsRouter.route("/:chatId").get(verifyToken, getChatById);

// Send message
// chatsRouter
//   .route("/:chatId")
//   .post(sendMessageValidation(), validateRequestBody, sendMessage);

// Update or delete message
chatsRouter
  .route("/:chatId")
  .patch(
    updateOrDeleteMessageValidation(),
    validateRequestBody,
    updateOrDeleteMessage
  );

export default chatsRouter;
