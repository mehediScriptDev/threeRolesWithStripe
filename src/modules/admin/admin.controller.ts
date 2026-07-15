import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as adminService from "./admin.service.js";

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await adminService.getAllUsers();

  res.status(200).json({
    success: true,
    data: users,
  });
});

export const updateUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await adminService.updateUserStatus(
      req.params.id as string,
      req.body.status,
    );

    res.status(200).json({
      success: true,
      message: "User status updated",
      data: user,
    });
  },
);

export const getAllGear = asyncHandler(async (_req: Request, res: Response) => {
  const gear = await adminService.getAllGear();

  res.status(200).json({
    success: true,
    data: gear,
  });
});

export const getAllRentals = asyncHandler(
  async (_req: Request, res: Response) => {
    const rentals = await adminService.getAllRentals();

    res.status(200).json({
      success: true,
      data: rentals,
    });
  },
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await adminService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Category created",
      data: category,
    });
  },
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const category = await adminService.updateCategory(
      req.params.id as string,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Category updated",
      data: category,
    });
  },
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await adminService.deleteCategory(req.params.id as string);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  },
);
