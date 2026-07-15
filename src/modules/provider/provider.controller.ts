import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as providerService from "./provider.service.js";

export const addGear = asyncHandler(async (req: Request, res: Response) => {
  const gear = await providerService.addGear(req.user!.userId, req.body);

  res.status(201).json({
    success: true,
    message: "Gear added successfully",
    data: gear,
  });
});

export const updateGear = asyncHandler(async (req: Request, res: Response) => {
  const gear = await providerService.updateGear(
    req.user!.userId,
    req.params.id as string,
    req.body,
  );

  res.status(200).json({
    success: true,
    message: "Gear updated successfully",
    data: gear,
  });
});

export const deleteGear = asyncHandler(async (req: Request, res: Response) => {
  const result = await providerService.deleteGear(
    req.user!.userId,
    req.params.id as string,
  );

  res.status(200).json({
    success: true,
    message: result.message,
  });
});

export const getMyGear = asyncHandler(async (req: Request, res: Response) => {
  const gear = await providerService.getMyGear(req.user!.userId);

  res.status(200).json({
    success: true,
    data: gear,
  });
});
