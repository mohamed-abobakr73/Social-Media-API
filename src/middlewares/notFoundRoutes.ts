import { Request, Response } from "express";
import httpStatusText from "../utils/httpStatusText";

const notFoundRoutes = (req: Request, res: Response) => {
  res.status(404).json({
    status: httpStatusText.NOT_FOUND,
    message: "Route not found.",
  });
};

export default notFoundRoutes;
