import "dotenv/config";

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: required("DATABASE_URL"),
  jwt: {
    secret: process.env.JWT_SECRET || "gearup-dev-secret-change-me",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
} as const;
