import type { LeadRecord } from "../lead/domain/Lead.js";

export type HubSpotServiceConfig = {
  baseUrl: string;
  accessToken?: string;
  timeoutMs: number;
  retries: number;
};

export type HubSpotSearchRequest = {
  filterGroups: Array<{
    filters: Array<{
      propertyName: string;
      operator: "EQ";
      value: string;
    }>;
  }>;
  limit: number;
  properties: string[];
};

export type HubSpotContact = {
  id: string;
  properties: Record<string, string | null | undefined>;
};

export type HubSpotSearchResponse = {
  total: number;
  results: HubSpotContact[];
};

export type HubSpotCreateOrUpdatePayload = {
  properties: {
    email: string;
    firstname: string;
    lastname: string;
    company?: string;
    budget?: string;
    estimated_pipeline_value?: string;
  };
};

export type HubSpotHealthStatus = {
  service: "hubspot";
  ok: boolean;
  configured: boolean;
  retries: number;
  details: string;
};

export type LeadHubSpotSyncResult = {
  contactId: string;
  action: "created" | "updated";
};

export type LeadForHubSpot = Pick<
  LeadRecord,
  "email" | "firstName" | "lastName" | "company" | "budget" | "estimatedValue"
>;
