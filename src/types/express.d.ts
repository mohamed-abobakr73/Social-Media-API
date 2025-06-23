import TCurrentUser from "./TCurrentUser";

declare global {
  namespace Express {
    interface Request {
      currentUser?: TCurrentUser;
    }
  }
}
