import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { createSwaggerSpec } from "./config/swagger.js";
import { errorHandler } from "./core/errors/errorHandler.js";
import { notFoundHandler } from "./core/middlewares/notFound.js";
import { prismaClient } from "./infrastructure/db/prismaClient.js";
import type { HubSpotService } from "./modules/hubspot/hubspot.service.js";
import { createHubspotRouter } from "./modules/hubspot/hubspot.routes.js";
import { ChatService } from "./modules/chat/application/ChatService.js";
import { PrismaMessageRepository } from "./modules/chat/infrastructure/PrismaMessageRepository.js";
import { ChatController } from "./modules/chat/interfaces/http/chat.controller.js";
import { createChatRouter } from "./modules/chat/interfaces/http/chat.routes.js";
import { LeadService } from "./modules/lead/application/LeadService.js";
import type { LeadEventPublisher } from "./modules/lead/application/LeadEventPublisher.js";
import { PrismaLeadRepository } from "./modules/lead/infrastructure/PrismaLeadRepository.js";
import { LeadController } from "./modules/lead/interfaces/http/lead.controller.js";
import { createLeadRouter } from "./modules/lead/interfaces/http/lead.routes.js";

type AppDependencies = {
  leadEventPublisher: LeadEventPublisher;
  hubspotService: HubSpotService;
};

export const buildApp = (origin: string, dependencies: AppDependencies) => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));

  const messageRepository = new PrismaMessageRepository(prismaClient);
  const chatService = new ChatService(messageRepository);
  const chatController = new ChatController(chatService);
  const leadRepository = new PrismaLeadRepository(prismaClient);
  const leadService = new LeadService(leadRepository, dependencies.leadEventPublisher);
  const leadController = new LeadController(leadService);

  app.get("/health", (_request, response) => {
    response.status(200).json({ status: "ok" });
  });

  const swaggerSpec = createSwaggerSpec();
  app.get("/api/docs.json", (_request, response) => {
    response.status(200).json(swaggerSpec);
  });
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.use("/api/chat", createChatRouter(chatController));
  app.use("/api", createLeadRouter(leadController));
  app.use("/api", createHubspotRouter(dependencies.hubspotService));
  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, chatService };
};
