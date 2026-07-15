import { prisma } from "../../lib/prisma.js";

const toSlug = (name: string) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
};

export const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

export const createCategory = async (name: string, description?: string) => {
  return prisma.category.create({
    data: {
      name: name.trim(),
      slug: toSlug(name),
      description: description?.trim() || null,
    },
  });
};
