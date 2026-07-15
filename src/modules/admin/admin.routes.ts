import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/role.js";
import * as adminController from "./admin.controller.js";

const adminRoutes = Router();

adminRoutes.use(authenticate, authorize(Role.ADMIN));

adminRoutes.get("/users", adminController.getAllUsers);
adminRoutes.patch("/users/:id", adminController.updateUserStatus);

adminRoutes.get("/gear", adminController.getAllGear);
adminRoutes.get("/rentals", adminController.getAllRentals);

adminRoutes.post("/categories", adminController.createCategory);
adminRoutes.put("/categories/:id", adminController.updateCategory);
adminRoutes.delete("/categories/:id", adminController.deleteCategory);

export default adminRoutes;
