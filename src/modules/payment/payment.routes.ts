import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/role.js";
import * as paymentController from "./payment.controller.js";

const paymentRoutes = Router();

paymentRoutes.use(authenticate, authorize(Role.CUSTOMER));

paymentRoutes.post("/create", paymentController.createPayment);
paymentRoutes.post("/confirm", paymentController.confirmPayment);
paymentRoutes.get("/", paymentController.getMyPayments);
paymentRoutes.get("/:id", paymentController.getPaymentById);

export default paymentRoutes;
