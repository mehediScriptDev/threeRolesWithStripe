import { Router } from "express";
import { Role } from "../../../generated/prisma/client.js";
import { authenticate } from "../../middlewares/auth.js";
import { authorize } from "../../middlewares/role.js";
import * as providerController from "./provider.controller.js";

const providerRoutes = Router();

providerRoutes.use(authenticate, authorize(Role.PROVIDER));

providerRoutes.get("/gear", providerController.getMyGear);
providerRoutes.post("/gear", providerController.addGear);
providerRoutes.put("/gear/:id", providerController.updateGear);
providerRoutes.delete("/gear/:id", providerController.deleteGear);

export default providerRoutes;
