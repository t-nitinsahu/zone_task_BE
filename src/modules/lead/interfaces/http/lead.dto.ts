import { HubspotStatus, LeadStatus } from "@prisma/client";
import { z } from "zod";

export const createLeadSchema = z
  .object({
    firstName: z.string().trim().min(1, "firstName is required").max(100),
    lastName: z.string().trim().min(1, "lastName is required").max(100),
    email: z.string().trim().min(1, "email is required").email("email must be valid"),
    company: z.string().trim().min(1, "company is required").max(200),
    budget: z.coerce.number().positive("budget must be greater than zero"),
    hubspotContactId: z.string().trim().min(1).max(100).optional(),
    localStatus: z.nativeEnum(LeadStatus).optional(),
    hubspotStatus: z.nativeEnum(HubspotStatus).optional()
  })
  .strict();

export type CreateLeadRequestDto = z.infer<typeof createLeadSchema>;
