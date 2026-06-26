import { HubspotStatus, LeadStatus, Prisma } from "@prisma/client";
import type { PrismaClient } from "@prisma/client";

import type { CreateLeadCommand, DashboardStats, LeadRecord, LeadRepository } from "../domain/Lead.js";

const statusDefaults: Record<LeadStatus, number> = {
  NEW: 0,
  QUALIFIED: 0,
  CONTACTED: 0,
  WON: 0,
  LOST: 0,
  ARCHIVED: 0
};

const hubspotStatusDefaults: Record<HubspotStatus, number> = {
  PENDING_SYNC: 0,
  SYNCED: 0,
  FAILED: 0
};

const decimalToNumber = (value: Prisma.Decimal | null): number | null => {
  if (!value) {
    return null;
  }

  return value.toNumber();
};

const toRecord = (lead: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string | null;
  budget: Prisma.Decimal | null;
  estimatedValue: Prisma.Decimal | null;
  hubspotContactId: string | null;
  localStatus: LeadStatus;
  hubspotStatus: "PENDING_SYNC" | "SYNCED" | "FAILED";
  createdAt: Date;
  updatedAt: Date;
}): LeadRecord => ({
  id: lead.id,
  firstName: lead.firstName,
  lastName: lead.lastName,
  email: lead.email,
  company: lead.company,
  budget: decimalToNumber(lead.budget),
  estimatedValue: decimalToNumber(lead.estimatedValue),
  hubspotContactId: lead.hubspotContactId,
  localStatus: lead.localStatus,
  hubspotStatus: lead.hubspotStatus,
  createdAt: lead.createdAt.toISOString(),
  updatedAt: lead.updatedAt.toISOString()
});

export class PrismaLeadRepository implements LeadRepository {
  public constructor(private readonly client: PrismaClient) {}

  public async create(command: CreateLeadCommand): Promise<LeadRecord> {
    const created = await this.client.lead.create({
      data: {
        firstName: command.firstName,
        lastName: command.lastName,
        email: command.email,
        company: command.company,
        budget: command.budget,
        estimatedValue: command.estimatedValue,
        hubspotContactId: command.hubspotContactId,
        localStatus: command.localStatus,
        hubspotStatus: command.hubspotStatus
      }
    });

    return toRecord(created);
  }

  public async list(): Promise<LeadRecord[]> {
    const rows = await this.client.lead.findMany({
      orderBy: { createdAt: "desc" }
    });

    return rows.map(toRecord);
  }

  public async getDashboardStats(): Promise<DashboardStats> {
    const [totalLeads, aggregates, groupedByStatus, groupedByHubspotStatus] = await Promise.all([
      this.client.lead.count(),
      this.client.lead.aggregate({
        _sum: {
          estimatedValue: true
        },
        _avg: {
          estimatedValue: true
        }
      }),
      this.client.lead.groupBy({
        by: ["localStatus"],
        _count: {
          _all: true
        }
      }),
      this.client.lead.groupBy({
        by: ["hubspotStatus"],
        _count: {
          _all: true
        }
      })
    ]);

    const statusBreakdown: Record<LeadStatus, number> = { ...statusDefaults };
    const hubspotBreakdown: Record<HubspotStatus, number> = { ...hubspotStatusDefaults };

    for (const group of groupedByStatus) {
      statusBreakdown[group.localStatus] = group._count._all;
    }

    for (const group of groupedByHubspotStatus) {
      hubspotBreakdown[group.hubspotStatus] = group._count._all;
    }

    return {
      totalLeads,
      totalPipelineValue: decimalToNumber(aggregates._sum.estimatedValue) ?? 0,
      averagePipelineValue: decimalToNumber(aggregates._avg.estimatedValue) ?? 0,
      syncedLeads: hubspotBreakdown.SYNCED,
      failedSync: hubspotBreakdown.FAILED,
      statusBreakdown
    };
  }

  public async markHubspotSynced(leadId: string, hubspotContactId: string): Promise<LeadRecord> {
    const updated = await this.client.lead.update({
      where: { id: leadId },
      data: {
        hubspotContactId,
        hubspotStatus: HubspotStatus.SYNCED
      }
    });

    return toRecord(updated);
  }
}
