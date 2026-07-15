import jwt from "jsonwebtoken";
import type { Role } from "../../generated/prisma/client.js";
import { config } from "../config/index.js";

export type JwtPayload = {
  userId: string;
  email: string;
  role: Role;
};

export const signToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
};
