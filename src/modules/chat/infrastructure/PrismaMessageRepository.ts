import type { PrismaClient } from "@prisma/client";

import type { CreateMessageCommand, Message, MessageRepository } from "../domain/Message.js";

const toDomainMessage = (value: {
  id: string;
  userName: string;
  content: string;
  createdAt: Date;
}): Message => ({
  id: value.id,
  userName: value.userName,
  content: value.content,
  createdAt: value.createdAt.toISOString()
});

export class PrismaMessageRepository implements MessageRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async create(command: CreateMessageCommand): Promise<Message> {
    const created = await this.client.message.create({
      data: {
        userName: command.userName,
        content: command.content
      }
    });

    return toDomainMessage(created);
  }

  public async list(limit: number): Promise<Message[]> {
    const rows = await this.client.message.findMany({
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return rows.map(toDomainMessage).reverse();
  }
}
