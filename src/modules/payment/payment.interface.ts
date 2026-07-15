export type CreatePaymentInput = {
  rentalOrderId: string;
  method: "STRIPE" | "SSLCOMMERZ";
};

export type ConfirmPaymentInput = {
  paymentId: string;
  transactionId?: string;
};
