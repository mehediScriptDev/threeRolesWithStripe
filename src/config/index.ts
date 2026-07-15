import "dotenv/config";

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const sslIsSandbox = (process.env.SSLCOMMERZ_IS_SANDBOX || "true") === "true";

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: required("DATABASE_URL"),
  appUrl: process.env.APP_URL || "http://localhost:3000",
  jwt: {
    secret: process.env.JWT_SECRET || "gearup-dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
  },
  sslcommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID || "",
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || "",
    initUrl: sslIsSandbox
      ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
      : "https://securepay.sslcommerz.com/gwprocess/v4/api.php",
    validationUrl: sslIsSandbox
      ? "https://sandbox.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php"
      : "https://securepay.sslcommerz.com/validator/api/merchantTransIDvalidationAPI.php",
  },
} as const;
