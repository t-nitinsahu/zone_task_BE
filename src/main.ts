import { createServer } from "http";

import { buildApp } from "./app.js";
import { env } from "./config/env.js";
import { prismaClient } from "./infrastructure/db/prismaClient.js";
import { SocketService } from "./infrastructure/realtime/SocketService.js";
import { HubSpotService } from "./modules/hubspot/hubspot.service.js";

const bootstrap = async (): Promise<void> => {
  const socketService = new SocketService();
  const hubspotService = new HubSpotService({
    baseUrl: env.HUBSPOT_BASE_URL,
    accessToken: env.HUBSPOT_ACCESS_TOKEN,
    timeoutMs: env.HUBSPOT_TIMEOUT_MS,
    retries: 3
  });

  const { app, chatService } = buildApp(env.API_ORIGIN, {
    leadEventPublisher: socketService,
    hubspotService
  });
  const server = createServer(app);

  socketService.attach(server, env.API_ORIGIN);
  socketService.registerChatHandlers(chatService);

  server.listen(env.API_PORT, () => {
    console.log(`API listening on http://localhost:${env.API_PORT}`);
  });

  const shutdown = async (): Promise<void> => {
    await prismaClient.$disconnect();
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGINT", () => {
    void shutdown();
  });

  process.on("SIGTERM", () => {
    void shutdown();
  });
};

void bootstrap();
