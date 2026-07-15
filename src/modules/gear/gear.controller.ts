import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as gearService from "./gear.service.js";

export const getAllGear = asyncHandler(async (req: Request, res: Response) => {
  const filters = {
    category: req.query.category as string | undefined,
    brand: req.query.brand as string | undefined,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    available:
      req.query.available !== undefined
        ? req.query.available === "true"
        : undefined,
  };

  const gear = await gearService.getAllGear(filters);

  res.status(200).json({
    success: true,
    data: gear,
  });
});

export const getGearById = asyncHandler(async (req: Request, res: Response) => {
  const gear = await gearService.getGearById(req.params.id as string);

  res.status(200).json({
    success: true,
    data: gear,
  });
});
