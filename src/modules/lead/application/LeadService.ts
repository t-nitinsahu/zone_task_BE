import { StatusCodes } from "http-status-codes";
import { HubspotStatus } from "@prisma/client";

import { AppError } from "../../../core/errors/AppError.js";
import type { CreateLeadCommand, DashboardStats, LeadRecord, LeadRepository } from "../domain/Lead.js";
import { createLeadSchema, type CreateLeadRequestDto } from "../interfaces/http/lead.dto.js";
import type { LeadEventPublisher } from "./LeadEventPublisher.js";

export class LeadService {
  public constructor(
    private readonly repository: LeadRepository,
    private readonly eventPublisher: LeadEventPublisher
  ) {}

  public async createLead(input: CreateLeadRequestDto): Promise<LeadRecord> {
    const parsed = createLeadSchema.safeParse(input);

    if (!parsed.success) {
      throw new AppError("Invalid lead payload", StatusCodes.BAD_REQUEST, parsed.error.flatten().fieldErrors);
    }

    const estimatedValue = parsed.data.budget;

    const command: CreateLeadCommand = {
      ...parsed.data,
      estimatedValue
    };

    const created = await this.repository.create(command);

    this.eventPublisher.emitLeadCreated(created);

    if (created.hubspotStatus === HubspotStatus.SYNCED) {
      this.eventPublisher.emitHubspotSynced(created);
    }

    return created;
  }

  public async listLeads(): Promise<LeadRecord[]> {
    return this.repository.list();
  }

  public async getDashboardStats(): Promise<DashboardStats> {
    return this.repository.getDashboardStats();
  }

  public async completeHubspotSync(leadId: string, hubspotContactId: string): Promise<LeadRecord> {
    const updated = await this.repository.markHubspotSynced(leadId, hubspotContactId);
    this.eventPublisher.emitHubspotSynced(updated);
    return updated;
  }
}
