import type { Server as HttpServer } from "http";

import type { CreateMessageInput } from "../../shared/index.js";
import { Server } from "socket.io";

import type { ChatService } from "../../modules/chat/application/ChatService.js";
import type { LeadEventPublisher } from "../../modules/lead/application/LeadEventPublisher.js";
import type { LeadRecord } from "../../modules/lead/domain/Lead.js";

type SocketErrorPayload = {
  message: string;
};

export class SocketService implements LeadEventPublisher {
  private io: Server | null = null;
  private chatHandlersRegistered = false;

  public attach(server: HttpServer, origin: string): void {
    if (this.io) {
      return;
    }

    this.io = new Server(server, {
      cors: {
        origin,
        credentials: true
      }
    });
  }

  public registerChatHandlers(chatService: ChatService): void {
    if (!this.io || this.chatHandlersRegistered) {
      return;
    }

    this.chatHandlersRegistered = true;

    this.io.on("connection", (socket) => {
      socket.on("chat:send", async (payload: CreateMessageInput) => {
        try {
          const message = await chatService.createMessage(payload);
          this.io?.emit("chat:new-message", message);
        } catch (error) {
          const output: SocketErrorPayload = {
            message: error instanceof Error ? error.message : "Unexpected socket error"
          };
          socket.emit("chat:error", output);
        }
      });
    });
  }

  public emitLeadCreated(lead: LeadRecord): void {
    this.io?.emit("lead_created", lead);
  }

  public emitHubspotSynced(lead: LeadRecord): void {
    this.io?.emit("hubspot_synced", lead);
  }
}
