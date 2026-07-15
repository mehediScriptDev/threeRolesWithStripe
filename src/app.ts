import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import gearRoutes from "./modules/gear/gear.routes.js";
import paymentRoutes from "./modules/payment/payment.routes.js";
import providerRoutes from "./modules/provider/provider.routes.js";
import rentalRoutes from "./modules/rental/rental.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: "GearUp API — Rent Sports & Outdoor Gear Instantly",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({ success: true, status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/gear", gearRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;
