import type { Role } from "../../../generated/prisma/client.js";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type AuthResponse = {
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
    status: string;
  };
  token: string;
};
