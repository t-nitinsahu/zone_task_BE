import { Router } from "express";

import { asyncHandler } from "../../../../core/middlewares/asyncHandler.js";
import { validateBody } from "../../../../core/middlewares/validateBody.js";
import type { LeadController } from "./lead.controller.js";
import { createLeadSchema } from "./lead.validation.js";

export const createLeadRouter = (controller: LeadController): Router => {
  const router = Router();

  router.post("/leads", validateBody(createLeadSchema), asyncHandler(controller.createLead));
  router.get("/leads", asyncHandler(controller.listLeads));
  router.get("/dashboard/stats", asyncHandler(controller.getDashboardStats));

  return router;
};
