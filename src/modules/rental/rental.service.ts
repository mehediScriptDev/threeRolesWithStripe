import {
  RentalOrderStatus,
  type Prisma,
} from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateRentalInput } from "./rental.interface.js";

const orderInclude = {
  items: {
    include: {
      gearItem: {
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
      },
    },
  },
  payments: true,
} satisfies Prisma.RentalOrderInclude;

const getRentalDays = (startDate: Date, endDate: Date) => {
  const msPerDay = 1000 * 60 * 60 * 24;
  const days = Math.ceil((endDate.getTime() - startDate.getTime()) / msPerDay);
  return days < 1 ? 1 : days;
};

export const createRental = async (
  customerId: string,
  input: CreateRentalInput,
) => {
  const { startDate, endDate, items } = input;

  if (!startDate || !endDate || !items || items.length === 0) {
    throw new AppError("startDate, endDate, and items are required", 400);
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new AppError("Invalid startDate or endDate", 400);
  }

  if (end < start) {
    throw new AppError("endDate must be after startDate", 400);
  }

  const gearIds = items.map((item) => item.gearItemId);
  const gearItems = await prisma.gearItem.findMany({
    where: { id: { in: gearIds } },
  });

  if (gearItems.length !== gearIds.length) {
    throw new AppError("One or more gear items were not found", 404);
  }

  const providerIds = new Set(gearItems.map((item) => item.providerId));
  if (providerIds.size > 1) {
    throw new AppError("All gear items must belong to the same provider", 400);
  }

  for (const item of items) {
    if (!item.quantity || item.quantity < 1) {
      throw new AppError("Each item quantity must be at least 1", 400);
    }

    const gear = gearItems.find((g) => g.id === item.gearItemId)!;

    if (!gear.isAvailable) {
      throw new AppError(`${gear.name} is not available`, 400);
    }

    if (gear.stock < item.quantity) {
      throw new AppError(
        `Not enough stock for ${gear.name}. Available: ${gear.stock}`,
        400,
      );
    }
  }

  const days = getRentalDays(start, end);
  let totalAmount = 0;

  const orderItemsData = items.map((item) => {
    const gear = gearItems.find((g) => g.id === item.gearItemId)!;
    const pricePerDay = Number(gear.pricePerDay);
    totalAmount += pricePerDay * item.quantity * days;

    return {
      gearItemId: item.gearItemId,
      quantity: item.quantity,
      pricePerDay: gear.pricePerDay,
    };
  });

  const order = await prisma.$transaction(async (tx) => {
    for (const item of items) {
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: {
          stock: { decrement: item.quantity },
        },
      });
    }

    return tx.rentalOrder.create({
      data: {
        customerId,
        startDate: start,
        endDate: end,
        totalAmount,
        status: RentalOrderStatus.PLACED,
        items: {
          create: orderItemsData,
        },
      },
      include: orderInclude,
    });
  });

  return order;
};

export const getMyRentals = async (customerId: string) => {
  return prisma.rentalOrder.findMany({
    where: { customerId },
    include: orderInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getRentalById = async (customerId: string, rentalId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalId },
    include: orderInclude,
  });

  if (!order) {
    throw new AppError("Rental order not found", 404);
  }

  if (order.customerId !== customerId) {
    throw new AppError("You can only view your own rental orders", 403);
  }

  return order;
};

export const cancelRental = async (customerId: string, rentalId: string) => {
  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError("Rental order not found", 404);
  }

  if (order.customerId !== customerId) {
    throw new AppError("You can only cancel your own rental orders", 403);
  }

  if (order.status !== RentalOrderStatus.PLACED) {
    throw new AppError("Only PLACED orders can be cancelled", 400);
  }

  return prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      await tx.gearItem.update({
        where: { id: item.gearItemId },
        data: {
          stock: { increment: item.quantity },
        },
      });
    }

    return tx.rentalOrder.update({
      where: { id: rentalId },
      data: { status: RentalOrderStatus.CANCELLED },
      include: orderInclude,
    });
  });
};
