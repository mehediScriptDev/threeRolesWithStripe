import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as rentalService from "./rental.service.js";

export const createRental = asyncHandler(async (req: Request, res: Response) => {
  const order = await rentalService.createRental(req.user!.userId, req.body);

  res.status(201).json({
    success: true,
    message: "Rental order placed successfully",
    data: order,
  });
});

export const getMyRentals = asyncHandler(async (req: Request, res: Response) => {
  const orders = await rentalService.getMyRentals(req.user!.userId);

  res.status(200).json({
    success: true,
    data: orders,
  });
});

export const getRentalById = asyncHandler(async (req: Request, res: Response) => {
  const order = await rentalService.getRentalById(
    req.user!.userId,
    req.params.id as string,
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});

export const cancelRental = asyncHandler(async (req: Request, res: Response) => {
  const order = await rentalService.cancelRental(
    req.user!.userId,
    req.params.id as string,
  );

  res.status(200).json({
    success: true,
    message: "Rental order cancelled",
    data: order,
  });
});
