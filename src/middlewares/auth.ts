import type { NextFunction, Request, Response } from "express";
import type { Role } from "../../generated/prisma/client.js";
import { AppError } from "../utils/AppError.js";
import { verifyToken, type JwtPayload } from "../utils/jwt.js";

export type AuthUser = JwtPayload;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError("Authentication required", 401);
    }

    const token = authHeader.slice(7);
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    return next(new AppError("Invalid or expired token", 401));
  }
};

export type { Role };
