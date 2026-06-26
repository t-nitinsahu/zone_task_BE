import type { HubspotStatus, LeadStatus } from "@prisma/client";

export type LeadRecord = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	company: string | null;
	budget: number | null;
	estimatedValue: number | null;
	hubspotContactId: string | null;
	localStatus: LeadStatus;
	hubspotStatus: HubspotStatus;
	createdAt: string;
	updatedAt: string;
};

export type CreateLeadCommand = {
	firstName: string;
	lastName: string;
	email: string;
	company: string;
	budget: number;
	estimatedValue: number;
	hubspotContactId?: string;
	localStatus?: LeadStatus;
	hubspotStatus?: HubspotStatus;
};

export type DashboardStats = {
	totalLeads: number;
	totalPipelineValue: number;
	averagePipelineValue: number;
	syncedLeads: number;
	failedSync: number;
	statusBreakdown: Record<LeadStatus, number>;
};

export interface LeadRepository {
	create(command: CreateLeadCommand): Promise<LeadRecord>;
	list(): Promise<LeadRecord[]>;
	getDashboardStats(): Promise<DashboardStats>;
	markHubspotSynced(leadId: string, hubspotContactId: string): Promise<LeadRecord>;
}
