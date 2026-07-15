import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Application, type Request, type Response } from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import categoryRoutes from "./modules/category/category.routes.js";
import gearRoutes from "./modules/gear/gear.routes.js";
import providerRoutes from "./modules/provider/provider.routes.js";

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

app.use(errorHandler);

export default app;
