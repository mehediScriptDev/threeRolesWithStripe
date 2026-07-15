import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler.js";
import * as paymentService from "./payment.service.js";

export const createPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await paymentService.createPayment(req.user!.userId, req.body);

    res.status(201).json({
      success: true,
      message: "Payment session created",
      data: result,
    });
  },
);

export const confirmPayment = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await paymentService.confirmPayment(
      req.user!.userId,
      req.body,
    );

    res.status(200).json({
      success: true,
      message: "Payment confirmed",
      data: payment,
    });
  },
);

export const getMyPayments = asyncHandler(
  async (req: Request, res: Response) => {
    const payments = await paymentService.getMyPayments(req.user!.userId);

    res.status(200).json({
      success: true,
      data: payments,
    });
  },
);

export const getPaymentById = asyncHandler(
  async (req: Request, res: Response) => {
    const payment = await paymentService.getPaymentById(
      req.user!.userId,
      req.params.id as string,
    );

    res.status(200).json({
      success: true,
      data: payment,
    });
  },
);
