import { Router } from "express";
import * as gearController from "./gear.controller.js";

const gearRoutes = Router();

gearRoutes.get("/", gearController.getAllGear);
gearRoutes.get("/:id", gearController.getGearById);

export default gearRoutes;
