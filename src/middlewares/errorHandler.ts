import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/AppError.js";
import { config } from "../config/index.js";

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  console.error(err);

  return res.status(500).json({
    success: false,
    message:
      config.nodeEnv === "production"
        ? "Internal server error"
        : err.message || "Internal server error",
  });
};
