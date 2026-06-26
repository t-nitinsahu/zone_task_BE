import { createMessageSchema, type CreateMessageInput, type MessageDto } from "../../../shared/index.js";
import { StatusCodes } from "http-status-codes";

import { AppError } from "../../../core/errors/AppError.js";
import type { MessageRepository } from "../domain/Message.js";

export class ChatService {
  public constructor(private readonly repository: MessageRepository) {}

  public async createMessage(input: CreateMessageInput): Promise<MessageDto> {
    const parsed = createMessageSchema.safeParse(input);

    if (!parsed.success) {
      throw new AppError("Invalid message payload", StatusCodes.BAD_REQUEST, parsed.error.flatten().fieldErrors);
    }

    return this.repository.create(parsed.data);
  }

  public async listMessages(limit = 50): Promise<MessageDto[]> {
    if (limit < 1 || limit > 100) {
      throw new AppError("Limit must be between 1 and 100", StatusCodes.BAD_REQUEST);
    }

    return this.repository.list(limit);
  }
}
