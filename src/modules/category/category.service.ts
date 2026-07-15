import { prisma } from "../../lib/prisma.js";

export const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};
