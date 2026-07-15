import type { UserStatus } from "../../../generated/prisma/client.js";

export type UpdateUserStatusInput = {
  status: UserStatus;
};

export type CreateCategoryInput = {
  name: string;
  description?: string;
};

export type UpdateCategoryInput = {
  name?: string;
  description?: string;
};
