import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as reviewService from "./review.service.js";

export const createReview = asyncHandler(
  async (req: Request, res: Response) => {
    const review = await reviewService.createReview(req.user!.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  },
);
