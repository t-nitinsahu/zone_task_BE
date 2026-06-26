import { z } from "zod";

export const messageContentSchema = z
  .string()
  .trim()
  .min(1, "Message is required")
  .max(500, "Message cannot exceed 500 characters");

export const createMessageSchema = z.object({
  userName: z.string().trim().min(2).max(30),
  content: messageContentSchema
});

export const messageSchema = z.object({
  id: z.string().uuid(),
  userName: z.string(),
  content: z.string(),
  createdAt: z.string().datetime()
});

export const messageListSchema = z.array(messageSchema);

export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type MessageDto = z.infer<typeof messageSchema>;
