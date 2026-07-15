import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/role.js";
import * as reviewController from "./review.controller.js";

const reviewRoutes = Router();

reviewRoutes.post(
  "/",
  authenticate,
  authorize(Role.CUSTOMER),
  reviewController.createReview,
);

export default reviewRoutes;
