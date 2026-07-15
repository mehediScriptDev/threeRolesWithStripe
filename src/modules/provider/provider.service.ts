import type { Prisma } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
  CreateGearInput,
  UpdateGearInput,
} from "./provider.interface.js";

export const addGear = async (providerId: string, input: CreateGearInput) => {
  const {
    categoryId,
    name,
    description,
    brand,
    pricePerDay,
    stock,
    isAvailable,
    specifications,
    imageUrl,
  } = input;

  if (!categoryId || !name || !description || !brand || pricePerDay === undefined) {
    throw new AppError(
      "categoryId, name, description, brand, and pricePerDay are required",
      400,
    );
  }

  if (pricePerDay <= 0) {
    throw new AppError("pricePerDay must be greater than 0", 400);
  }

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return prisma.gearItem.create({
    data: {
      providerId,
      categoryId,
      name: name.trim(),
      description: description.trim(),
      brand: brand.trim(),
      pricePerDay,
      stock: stock ?? 1,
      isAvailable: isAvailable ?? true,
      specifications: (specifications as Prisma.InputJsonValue) ?? undefined,
      imageUrl: imageUrl?.trim() || null,
    },
    include: {
      category: true,
    },
  });
};

export const updateGear = async (
  providerId: string,
  gearId: string,
  input: UpdateGearInput,
) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new AppError("Gear item not found", 404);
  }

  if (gear.providerId !== providerId) {
    throw new AppError("You can only update your own gear", 403);
  }

  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }
  }

  if (input.pricePerDay !== undefined && input.pricePerDay <= 0) {
    throw new AppError("pricePerDay must be greater than 0", 400);
  }

  return prisma.gearItem.update({
    where: { id: gearId },
    data: {
      categoryId: input.categoryId,
      name: input.name?.trim(),
      description: input.description?.trim(),
      brand: input.brand?.trim(),
      pricePerDay: input.pricePerDay,
      stock: input.stock,
      isAvailable: input.isAvailable,
      specifications:
        input.specifications !== undefined
          ? (input.specifications as Prisma.InputJsonValue)
          : undefined,
      imageUrl:
        input.imageUrl !== undefined
          ? input.imageUrl.trim() || null
          : undefined,
    },
    include: {
      category: true,
    },
  });
};

export const deleteGear = async (providerId: string, gearId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new AppError("Gear item not found", 404);
  }

  if (gear.providerId !== providerId) {
    throw new AppError("You can only delete your own gear", 403);
  }

  await prisma.gearItem.delete({
    where: { id: gearId },
  });

  return { message: "Gear item deleted successfully" };
};

export const getMyGear = async (providerId: string) => {
  return prisma.gearItem.findMany({
    where: { providerId },
    include: {
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const providerOrderInclude = {
  customer: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    include: {
      gearItem: {
        include: {
          category: true,
        },
      },
    },
  },
  payments: true,
} satisfies Prisma.RentalOrderInclude;

export const getIncomingOrders = async (providerId: string) => {
  return prisma.rentalOrder.findMany({
    where: {
      items: {
        some: {
          gearItem: {
            providerId,
          },
        },
      },
    },
    include: providerOrderInclude,
    orderBy: { createdAt: "desc" },
  });
};

const providerTransitions: Record<string, string[]> = {
  PLACED: ["CONFIRMED"],
  PAID: ["PICKED_UP"],
  PICKED_UP: ["RETURNED"],
};

export const updateOrderStatus = async (
  providerId: string,
  orderId: string,
  status: string,
) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          gearItem: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError("Rental order not found", 404);
  }

  const ownsOrder = order.items.some(
    (item) => item.gearItem.providerId === providerId,
  );

  if (!ownsOrder) {
    throw new AppError("You can only update orders for your own gear", 403);
  }

  const allowedNext = providerTransitions[order.status] || [];

  if (!allowedNext.includes(status)) {
    throw new AppError(
      `Cannot change status from ${order.status} to ${status}. Allowed: ${allowedNext.join(", ") || "none"}`,
      400,
    );
  }

  return prisma.rentalOrder.update({
    where: { id: orderId },
    data: { status: status as never },
    include: providerOrderInclude,
  });
};
