import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const notFoundHandler = (_request: Request, response: Response): void => {
  response.status(StatusCodes.NOT_FOUND).json({ message: "Route not found" });
};
