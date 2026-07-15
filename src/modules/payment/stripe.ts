import Stripe from "stripe";
import { config } from "../../config/index.js";
import { AppError } from "../../utils/AppError.js";

const getStripe = () => {
  if (!config.stripe.secretKey) {
    throw new AppError("STRIPE_SECRET_KEY is not configured", 500);
  }

  return new Stripe(config.stripe.secretKey);
};

export const createStripeIntent = async (input: {
  amount: number;
  paymentId: string;
  rentalOrderId: string;
}) => {
  const stripe = getStripe();
  const amountInCents = Math.round(input.amount * 100);

  const intent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: "usd",
    metadata: {
      paymentId: input.paymentId,
      rentalOrderId: input.rentalOrderId,
    },
  });

  return {
    transactionId: intent.id,
    clientSecret: intent.client_secret,
  };
};

export const verifyStripePayment = async (transactionId: string) => {
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(transactionId);
  return intent.status === "succeeded";
};
