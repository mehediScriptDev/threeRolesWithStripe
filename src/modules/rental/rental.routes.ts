import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/role.js";
import * as rentalController from "./rental.controller.js";

const rentalRoutes = Router();

rentalRoutes.use(authenticate, authorize(Role.CUSTOMER));

rentalRoutes.post("/", rentalController.createRental);
rentalRoutes.get("/", rentalController.getMyRentals);
rentalRoutes.get("/:id", rentalController.getRentalById);
rentalRoutes.patch("/:id/cancel", rentalController.cancelRental);

export default rentalRoutes;
