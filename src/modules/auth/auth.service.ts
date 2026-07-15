import bcrypt from "bcryptjs";
import { Role } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import { signToken } from "../../utils/jwt.js";
import type {
  AuthResponse,
  LoginInput,
  RegisterInput,
} from "./auth.interface.js";

const ALLOWED_ROLES: Role[] = [Role.CUSTOMER, Role.PROVIDER];

const hidePassword = <T extends { password: string }>(user: T) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const register = async (input: RegisterInput): Promise<AuthResponse> => {
  const { name, email, password, role } = input;

  if (!name || !email || !password || !role) {
    throw new AppError("Name, email, password, and role are required", 400);
  }

  if (!ALLOWED_ROLES.includes(role)) {
    throw new AppError("Role must be CUSTOMER or PROVIDER", 400);
  }

  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
    },
  });

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: hidePassword(user),
    token,
  };
};

export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const { email, password } = input;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (user.status === "SUSPENDED") {
    throw new AppError("Your account has been suspended", 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = signToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    user: hidePassword(user),
    token,
  };
};

export const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return hidePassword(user);
};
