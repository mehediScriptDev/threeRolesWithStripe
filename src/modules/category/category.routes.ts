import { Router } from "express";
import * as categoryController from "./category.controller.js";

const categoryRoutes = Router();

categoryRoutes.get("/", categoryController.getAllCategories);

export default categoryRoutes;
