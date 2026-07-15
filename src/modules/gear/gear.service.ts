import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { GearFilters } from "./gear.interface.js";

export const getAllGear = async (filters: GearFilters) => {
  const where: Prisma.GearItemWhereInput = {};

  if (filters.category) {
    where.OR = [
      { categoryId: filters.category },
      { category: { slug: filters.category } },
    ];
  }

  if (filters.brand) {
    where.brand = {
      contains: filters.brand,
      mode: "insensitive",
    };
  }

  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.pricePerDay = {};
    if (filters.minPrice !== undefined) {
      where.pricePerDay.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      where.pricePerDay.lte = filters.maxPrice;
    }
  }

  if (filters.available !== undefined) {
    where.isAvailable = filters.available;
  }

  return prisma.gearItem.findMany({
    where,
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

export const getGearById = async (id: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id },
    include: {
      category: true,
      provider: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      reviews: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!gear) {
    throw new AppError("Gear item not found", 404);
  }

  return gear;
};
