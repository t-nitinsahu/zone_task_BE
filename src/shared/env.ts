import { z } from "zod";

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(4000),
  API_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  HUBSPOT_BASE_URL: z.string().url().default("https://api.hubapi.com"),
  HUBSPOT_ACCESS_TOKEN: z.string().trim().min(1).optional(),
  HUBSPOT_TIMEOUT_MS: z.coerce.number().int().positive().default(5000)
});

export const webEnvSchema = z.object({
  WEB_API_BASE_URL: z.string().url(),
  WEB_SOCKET_URL: z.string().url()
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WebEnv = z.infer<typeof webEnvSchema>;
