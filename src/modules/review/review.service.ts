import { RentalOrderStatus } from "../../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type { CreateReviewInput } from "./review.interface.js";

export const createReview = async (
  customerId: string,
  input: CreateReviewInput,
) => {
  const { rentalOrderId, gearItemId, rating, comment } = input;

  if (!rentalOrderId || !gearItemId || rating === undefined) {
    throw new AppError(
      "rentalOrderId, gearItemId, and rating are required",
      400,
    );
  }

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError("Rating must be an integer between 1 and 5", 400);
  }

  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
    include: { items: true },
  });

  if (!order) {
    throw new AppError("Rental order not found", 404);
  }

  if (order.customerId !== customerId) {
    throw new AppError("You can only review your own rentals", 403);
  }

  if (order.status !== RentalOrderStatus.RETURNED) {
    throw new AppError("You can leave a review only after the gear is returned", 400);
  }

  const itemInOrder = order.items.find((item) => item.gearItemId === gearItemId);

  if (!itemInOrder) {
    throw new AppError("This gear item was not part of the rental order", 400);
  }

  const existing = await prisma.review.findUnique({
    where: {
      customerId_rentalOrderId_gearItemId: {
        customerId,
        rentalOrderId,
        gearItemId,
      },
    },
  });

  if (existing) {
    throw new AppError("You already reviewed this gear for this rental", 409);
  }

  return prisma.review.create({
    data: {
      customerId,
      rentalOrderId,
      gearItemId,
      rating,
      comment: comment?.trim() || null,
    },
    include: {
      gearItem: {
        select: {
          id: true,
          name: true,
          brand: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};
