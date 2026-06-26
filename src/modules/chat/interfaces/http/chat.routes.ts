import { createMessageSchema } from "../../../../shared/index.js";
import { Router } from "express";

import { asyncHandler } from "../../../../core/middlewares/asyncHandler.js";
import { validateBody } from "../../../../core/middlewares/validateBody.js";
import type { ChatController } from "./chat.controller.js";

export const createChatRouter = (controller: ChatController): Router => {
  const router = Router();

  router.get("/messages", asyncHandler(controller.listMessages));
  router.post("/messages", validateBody(createMessageSchema), asyncHandler(controller.createMessage));

  return router;
};
