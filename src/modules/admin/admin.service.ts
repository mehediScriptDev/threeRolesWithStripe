import { UserStatus } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./admin.interface.js";

const toSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

const hidePassword = <T extends { password: string }>(user: T) => {
  const { password: _password, ...safeUser } = user;
  return safeUser;
};

export const getAllUsers = async () => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return users.map(hidePassword);
};

export const updateUserStatus = async (userId: string, status: string) => {
  if (status !== UserStatus.ACTIVE && status !== UserStatus.SUSPENDED) {
    throw new AppError("Status must be ACTIVE or SUSPENDED", 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  if (user.role === "ADMIN") {
    throw new AppError("Admin status cannot be changed", 400);
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { status: status as UserStatus },
  });

  return hidePassword(updated);
};

export const getAllGear = async () => {
  return prisma.gearItem.findMany({
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllRentals = async () => {
  return prisma.rentalOrder.findMany({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: {
        include: {
          gearItem: true,
        },
      },
      payments: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const createCategory = async (input: CreateCategoryInput) => {
  if (!input.name) {
    throw new AppError("Category name is required", 400);
  }

  const existing = await prisma.category.findFirst({
    where: {
      OR: [{ name: input.name.trim() }, { slug: toSlug(input.name) }],
    },
  });

  if (existing) {
    throw new AppError("Category already exists", 409);
  }

  return prisma.category.create({
    data: {
      name: input.name.trim(),
      slug: toSlug(input.name),
      description: input.description?.trim() || null,
    },
  });
};

export const updateCategory = async (
  categoryId: string,
  input: UpdateCategoryInput,
) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return prisma.category.update({
    where: { id: categoryId },
    data: {
      name: input.name?.trim(),
      slug: input.name ? toSlug(input.name) : undefined,
      description:
        input.description !== undefined
          ? input.description.trim() || null
          : undefined,
    },
  });
};

export const deleteCategory = async (categoryId: string) => {
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: { gearItems: true },
      },
    },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  if (category._count.gearItems > 0) {
    throw new AppError(
      "Cannot delete category that still has gear items",
      400,
    );
  }

  await prisma.category.delete({
    where: { id: categoryId },
  });

  return { message: "Category deleted successfully" };
};
