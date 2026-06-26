export type Message = {
  id: string;
  userName: string;
  content: string;
  createdAt: string;
};

export type CreateMessageCommand = {
  userName: string;
  content: string;
};

export interface MessageRepository {
  create(command: CreateMessageCommand): Promise<Message>;
  list(limit: number): Promise<Message[]>;
}
