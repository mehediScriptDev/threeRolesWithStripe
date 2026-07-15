import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as categoryService from "./category.service.js";

export const getAllCategories = asyncHandler(
  async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      success: true,
      data: categories,
    });
  },
);
