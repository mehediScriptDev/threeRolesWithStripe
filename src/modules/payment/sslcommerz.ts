import { config } from "../../config/index.js";
import { AppError } from "../../utils/AppError.js";

export const createSslSession = async (input: {
  amount: number;
  paymentId: string;
  rentalOrderId: string;
  customerId: string;
}) => {
  if (!config.sslcommerz.storeId || !config.sslcommerz.storePassword) {
    throw new AppError("SSLCommerz credentials are not configured", 500);
  }

  const transactionId = `SSL-${input.paymentId.slice(0, 8)}-${Date.now()}`;

  const formData = new URLSearchParams();
  formData.append("store_id", config.sslcommerz.storeId);
  formData.append("store_passwd", config.sslcommerz.storePassword);
  formData.append("total_amount", input.amount.toFixed(2));
  formData.append("currency", "BDT");
  formData.append("tran_id", transactionId);
  formData.append(
    "success_url",
    `${config.appUrl}/api/payments/ssl/success`,
  );
  formData.append("fail_url", `${config.appUrl}/api/payments/ssl/fail`);
  formData.append("cancel_url", `${config.appUrl}/api/payments/ssl/cancel`);
  formData.append("cus_name", "GearUp Customer");
  formData.append("cus_email", "customer@gearup.com");
  formData.append("cus_add1", "Dhaka");
  formData.append("cus_city", "Dhaka");
  formData.append("cus_country", "Bangladesh");
  formData.append("cus_phone", "01700000000");
  formData.append("shipping_method", "NO");
  formData.append("product_name", "Gear Rental");
  formData.append("product_category", "Rental");
  formData.append("product_profile", "general");
  formData.append("value_a", input.paymentId);
  formData.append("value_b", input.rentalOrderId);
  formData.append("value_c", input.customerId);

  const response = await fetch(config.sslcommerz.initUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = (await response.json()) as {
    status?: string;
    GatewayPageURL?: string;
    failedreason?: string;
  };

  if (data.status !== "SUCCESS" || !data.GatewayPageURL) {
    throw new AppError(
      data.failedreason || "Failed to create SSLCommerz session",
      400,
    );
  }

  return {
    transactionId,
    gatewayUrl: data.GatewayPageURL,
  };
};

export const verifySslPayment = async (transactionId: string) => {
  if (!config.sslcommerz.storeId || !config.sslcommerz.storePassword) {
    throw new AppError("SSLCommerz credentials are not configured", 500);
  }

  const formData = new URLSearchParams();
  formData.append("store_id", config.sslcommerz.storeId);
  formData.append("store_passwd", config.sslcommerz.storePassword);
  formData.append("tran_id", transactionId);

  const response = await fetch(config.sslcommerz.validationUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
  });

  const data = (await response.json()) as {
    status?: string;
    element?: Array<{ status?: string }>;
  };

  if (Array.isArray(data.element) && data.element.length > 0) {
    return data.element[0]?.status === "VALID";
  }

  return data.status === "VALID" || data.status === "SUCCESS";
};
