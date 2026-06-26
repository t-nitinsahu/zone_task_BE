import { Router } from "express";

import { asyncHandler } from "../../core/middlewares/asyncHandler.js";
import type { HubSpotService } from "./hubspot.service.js";

export const createHubspotRouter = (hubspotService: HubSpotService): Router => {
  const router = Router();

  router.get(
    "/hubspot/status",
    asyncHandler(async (_request, response) => {
      const status = await hubspotService.healthCheck();
      const statusCode = status.ok ? 200 : 503;

      response.status(statusCode).json({
        success: status.ok,
        message: status.details,
        data: status
      });
    })
  );

  return router;
};
