import {
  PaymentMethod,
  PaymentStatus,
  RentalOrderStatus,
} from "../../../generated/prisma/client.js";
import { config } from "../../config/index.js";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../utils/AppError.js";
import type {
  ConfirmPaymentInput,
  CreatePaymentInput,
} from "./payment.interface.js";
import { createSslSession, verifySslPayment } from "./sslcommerz.js";
import { createStripeIntent, verifyStripePayment } from "./stripe.js";

const paymentInclude = {
  rentalOrder: {
    include: {
      items: {
        include: {
          gearItem: true,
        },
      },
    },
  },
};

export const createPayment = async (
  customerId: string,
  input: CreatePaymentInput,
) => {
  const { rentalOrderId, method } = input;

  if (!rentalOrderId || !method) {
    throw new AppError("rentalOrderId and method are required", 400);
  }

  if (method !== "STRIPE" && method !== "SSLCOMMERZ") {
    throw new AppError("method must be STRIPE or SSLCOMMERZ", 400);
  }

  const order = await prisma.rentalOrder.findUnique({
    where: { id: rentalOrderId },
  });

  if (!order) {
    throw new AppError("Rental order not found", 404);
  }

  if (order.customerId !== customerId) {
    throw new AppError("You can only pay for your own orders", 403);
  }

  if (order.status !== RentalOrderStatus.CONFIRMED) {
    throw new AppError("Only CONFIRMED orders can be paid", 400);
  }

  const existingPaid = await prisma.payment.findFirst({
    where: {
      rentalOrderId,
      status: PaymentStatus.COMPLETED,
    },
  });

  if (existingPaid) {
    throw new AppError("This order is already paid", 400);
  }

  const amount = Number(order.totalAmount);

  const payment = await prisma.payment.create({
    data: {
      rentalOrderId,
      customerId,
      amount,
      method: method as PaymentMethod,
      status: PaymentStatus.PENDING,
    },
  });

  if (method === "STRIPE") {
    const stripeResult = await createStripeIntent({
      amount,
      paymentId: payment.id,
      rentalOrderId,
    });

    const updated = await prisma.payment.update({
      where: { id: payment.id },
      data: { transactionId: stripeResult.transactionId },
      include: paymentInclude,
    });

    return {
      payment: updated,
      providerData: {
        clientSecret: stripeResult.clientSecret,
        publishableKey: config.stripe.publishableKey,
      },
    };
  }

  const sslResult = await createSslSession({
    amount,
    paymentId: payment.id,
    rentalOrderId,
    customerId,
  });

  const updated = await prisma.payment.update({
    where: { id: payment.id },
    data: { transactionId: sslResult.transactionId },
    include: paymentInclude,
  });

  return {
    payment: updated,
    providerData: {
      gatewayUrl: sslResult.gatewayUrl,
    },
  };
};

export const confirmPayment = async (
  customerId: string,
  input: ConfirmPaymentInput,
) => {
  const { paymentId, transactionId } = input;

  if (!paymentId) {
    throw new AppError("paymentId is required", 400);
  }

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.customerId !== customerId) {
    throw new AppError("You can only confirm your own payments", 403);
  }

  if (payment.status === PaymentStatus.COMPLETED) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      include: paymentInclude,
    });
  }

  let isPaid = false;
  let finalTransactionId = payment.transactionId || transactionId || null;

  if (payment.method === PaymentMethod.STRIPE) {
    if (!payment.transactionId) {
      throw new AppError("Stripe transaction id is missing", 400);
    }
    isPaid = await verifyStripePayment(payment.transactionId);
  } else {
    const txId = transactionId || payment.transactionId;
    if (!txId) {
      throw new AppError("SSLCommerz transaction id is required", 400);
    }
    isPaid = await verifySslPayment(txId);
    finalTransactionId = txId;
  }

  if (!isPaid) {
    await prisma.payment.update({
      where: { id: paymentId },
      data: { status: PaymentStatus.FAILED },
    });
    throw new AppError("Payment was not successful", 400);
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        transactionId: finalTransactionId,
        paidAt: new Date(),
      },
      include: paymentInclude,
    });

    await tx.rentalOrder.update({
      where: { id: payment.rentalOrderId },
      data: { status: RentalOrderStatus.PAID },
    });

    return updatedPayment;
  });

  return result;
};

export const getMyPayments = async (customerId: string) => {
  return prisma.payment.findMany({
    where: { customerId },
    include: paymentInclude,
    orderBy: { createdAt: "desc" },
  });
};

export const getPaymentById = async (customerId: string, paymentId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: paymentInclude,
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.customerId !== customerId) {
    throw new AppError("You can only view your own payments", 403);
  }

  return payment;
};
