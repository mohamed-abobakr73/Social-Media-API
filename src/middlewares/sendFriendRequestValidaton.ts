import { body, param } from "express-validator";

const sendFriendRequestValidaton = () => {
  return [
    body("recipientId").notEmpty().withMessage("Recipient id is required"),
  ];
};

export default sendFriendRequestValidaton;
