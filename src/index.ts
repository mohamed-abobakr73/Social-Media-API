import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import cors from "cors";
import { connectToDb } from "./config/";
import {
  usersRouter,
  groupsRouter,
  postsRouter,
  pagesRouter,
  chatsRouter,
  searchRouter,
  blockRouter,
  followersRouter,
} from "./routes/";
import { globalErrorHandler, notFoundRoutes } from "./middlewares/";
import friendshipRouter from "./routes/friendshipRoute";

// TODO add the get blocklist route, the followed resources route

const app = express();
const server = http.createServer(app);
export const io = new Server(server);

// Connecting to mongodb
connectToDb();

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("chat message", ({ chatId, content, senderId, messageId }) => {
    console.log(chatId, content, messageId);
    socket.to(chatId).emit("chat message", { messageId, content, senderId });
  });
  socket.on("update message", ({ chatId, messageId, content }) => {
    console.log("messageId", messageId);
    console.log("content", content);
    io.to(chatId).emit("update message", { messageId, content });
  });
  socket.on("delete message", ({ chatId, messageId }) => {
    console.log("messageId", messageId);
    io.to(chatId).emit("delete message", messageId);
  });
  socket.on("join chat", (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat: ${chatId}`);
  });

  // Handle typing event
  // socket.on("typing", ({ chatId, userId }) => {
  //   if (!typingStatus[chatId]) typingStatus[chatId] = {};
  //   typingStatus[chatId][userId] = true;
  //   socket.to(chatId).emit("typing", userId);
  // });

  // // Handle notTyping event
  // socket.on("notTyping", ({ chatId, userId }) => {
  //   if (typingStatus[chatId]) typingStatus[chatId][userId] = false;
  //   socket.to(chatId).emit("notTyping", userId);
  // });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

dotenv.config();
const port = process.env.PORT;

// Middlewares
app.use(morgan("dev"));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/friendship", friendshipRouter);
app.use("/api/v1/blocks", blockRouter);
app.use("/api/v1/groups", groupsRouter);
app.use("/api/v1/posts", postsRouter);
app.use("/api/v1/pages", pagesRouter);
app.use("/api/v1/followers", followersRouter);
app.use("/api/v1/chats", chatsRouter);
app.use("/api/v1/search", searchRouter);

// Global error handler
app.use(globalErrorHandler);

// Not found routes
app.all("*", notFoundRoutes);

server.listen(port || 5000, () => {
  console.log(`Server running on port ${port}`);
});
