import "dotenv/config";

import { apiEnvSchema, type ApiEnv } from "../shared/index.js";

const parsed = apiEnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid API environment configuration", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env: ApiEnv = parsed.data;
