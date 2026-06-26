import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type { ChatService } from "../../application/ChatService.js";

export class ChatController {
  public constructor(private readonly service: ChatService) {}

  public listMessages = async (request: Request, response: Response): Promise<void> => {
    const limit = Number(request.query.limit ?? 50);
    const messages = await this.service.listMessages(limit);
    response.status(StatusCodes.OK).json(messages);
  };

  public createMessage = async (request: Request, response: Response): Promise<void> => {
    const message = await this.service.createMessage(request.body);
    response.status(StatusCodes.CREATED).json(message);
  };
}
