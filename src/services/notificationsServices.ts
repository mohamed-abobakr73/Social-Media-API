// import mongoose from "mongoose";
// import { User } from "../models/usersModel";
// import AppError from "../utils/AppError";
// import httpStatusText from "../utils/httpStatusText";
// import notficationsMessages from "../utils/notficationsMessages";

// const addNotificationService = async (
//   type:
//     | "likePost"
//     | "commentPost"
//     | "sharePost"
//     | "followPage"
//     | "joinGroup"
//     | "leaveGroup",
//   sourceId: mongoose.Types.ObjectId,
//   additionalData: {
//     username: string;
//     content?: string;
//   }
// ) => {
//   const user = await User.findById(sourceId);
//   if (!user) {
//     const error = new AppError(
//       "An error occured during liking the post, pleasse try again later",
//       400,
//       httpStatusText.ERROR
//     );
//     return { error, type: "error" };
//   }
//   switch (type) {
//     case "likePost":
//       user.notifications.push({
//         message: notficationsMessages.likePostMessage(additionalData.username),
//       });
//       break;
//     case "commentPost":
//       user.notifications.push({
//         message: notficationsMessages.commentPostMessage(
//           additionalData.username,
//           additionalData.content!
//         ),
//       });
//       break;
//     case "sharePost":
//       user.notifications.push({
//         message: notficationsMessages.sharePostMessage(additionalData.username),
//       });
//       break;
//     case "followPage":
//       user.notifications.push({
//         message: notficationsMessages.sharePostMessage(additionalData.username),
//       });
//       break;
//     case "joinGroup":
//       user.notifications.push({
//         message: notficationsMessages.joinGroupMessage(
//           additionalData.username,
//           additionalData.content!
//         ),
//       });
//     case "leaveGroup":
//       user.notifications.push({
//         message: notficationsMessages.leaveGroupMessage(
//           additionalData.username,
//           additionalData.content!
//         ),
//       });
//       break;
//   }
//   await user.save();
//   return { type: "success" };
// };

// export default {
//   addNotificationService,
// };
