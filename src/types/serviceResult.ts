import { TAppError } from "../utils/AppError";

export type TServiceResult<T = unknown> =
  | { type: "success"; data?: T }
  | { type: "error"; error: TAppError };
