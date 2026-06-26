import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { StatusCodes } from "http-status-codes";

import { AppError } from "../../core/errors/AppError.js";
import { mapLeadToHubSpotPayload } from "./hubspot.mapper.js";
import type {
  HubSpotCreateOrUpdatePayload,
  HubSpotHealthStatus,
  HubSpotSearchRequest,
  HubSpotSearchResponse,
  HubSpotServiceConfig,
  LeadForHubSpot,
  LeadHubSpotSyncResult
} from "./hubspot.types.js";

type LoggerLike = {
  info: (message: string, meta?: unknown) => void;
  warn: (message: string, meta?: unknown) => void;
  error: (message: string, meta?: unknown) => void;
};

const defaultLogger: LoggerLike = {
  info: (message, meta) => {
    console.info(message, meta ?? "");
  },
  warn: (message, meta) => {
    console.warn(message, meta ?? "");
  },
  error: (message, meta) => {
    console.error(message, meta ?? "");
  }
};

export class HubSpotService {
  private readonly httpClient: AxiosInstance;

  public constructor(
    private readonly config: HubSpotServiceConfig,
    private readonly logger: LoggerLike = defaultLogger
  ) {
    this.httpClient = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeoutMs,
      headers: {
        "Content-Type": "application/json"
      }
    });
  }

  public async searchContactByEmail(email: string): Promise<string | null> {
    this.ensureConfigured();

    const requestBody: HubSpotSearchRequest = {
      filterGroups: [
        {
          filters: [
            {
              propertyName: "email",
              operator: "EQ",
              value: email
            }
          ]
        }
      ],
      limit: 1,
      properties: ["email", "firstname", "lastname"]
    };

    const response = await this.requestWithRetry<HubSpotSearchResponse>({
      method: "POST",
      url: "/crm/v3/objects/contacts/search",
      data: requestBody
    }, "searchContactByEmail");

    const existing = response.data.results[0];
    return existing?.id ?? null;
  }

  public async createContact(lead: LeadForHubSpot): Promise<string> {
    this.ensureConfigured();

    const payload = mapLeadToHubSpotPayload(lead);
    const response = await this.requestWithRetry<{ id: string }>({
      method: "POST",
      url: "/crm/v3/objects/contacts",
      data: payload
    }, "createContact");

    return response.data.id;
  }

  public async updateContact(contactId: string, lead: LeadForHubSpot): Promise<string> {
    this.ensureConfigured();

    const payload: HubSpotCreateOrUpdatePayload = mapLeadToHubSpotPayload(lead);

    const response = await this.requestWithRetry<{ id: string }>({
      method: "PATCH",
      url: `/crm/v3/objects/contacts/${contactId}`,
      data: payload
    }, "updateContact");

    return response.data.id;
  }

  public async upsertContactByEmail(lead: LeadForHubSpot): Promise<LeadHubSpotSyncResult> {
    const existingContactId = await this.searchContactByEmail(lead.email);

    if (!existingContactId) {
      const createdId = await this.createContact(lead);
      this.logger.info("HubSpot contact created", { email: lead.email, contactId: createdId });
      return {
        contactId: createdId,
        action: "created"
      };
    }

    const updatedId = await this.updateContact(existingContactId, lead);
    this.logger.info("HubSpot contact updated", { email: lead.email, contactId: updatedId });

    return {
      contactId: updatedId,
      action: "updated"
    };
  }

  public async healthCheck(): Promise<HubSpotHealthStatus> {
    const configured = Boolean(this.config.accessToken);

    if (!configured) {
      return {
        service: "hubspot",
        ok: false,
        configured: false,
        retries: this.config.retries,
        details: "HubSpot token is not configured"
      };
    }

    try {
      await this.requestWithRetry({
        method: "GET",
        url: "/crm/v3/objects/contacts?limit=1"
      }, "healthCheck");

      return {
        service: "hubspot",
        ok: true,
        configured: true,
        retries: this.config.retries,
        details: "HubSpot API reachable"
      };
    } catch (error) {
      this.logger.error("HubSpot health check failed", {
        error: error instanceof Error ? error.message : "Unknown error"
      });

      return {
        service: "hubspot",
        ok: false,
        configured: true,
        retries: this.config.retries,
        details: "HubSpot API unreachable"
      };
    }
  }

  private ensureConfigured(): void {
    if (!this.config.accessToken) {
      throw new AppError("HubSpot API token is not configured", StatusCodes.SERVICE_UNAVAILABLE);
    }
  }

  private async requestWithRetry<T>(
    requestConfig: AxiosRequestConfig,
    operationName: string
  ): Promise<AxiosResponse<T>> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.config.retries; attempt += 1) {
      try {
        this.logger.info("HubSpot request attempt", {
          operationName,
          attempt,
          method: requestConfig.method,
          url: requestConfig.url
        });

        return await this.httpClient.request<T>({
          ...requestConfig,
          headers: {
            ...requestConfig.headers,
            Authorization: `Bearer ${this.config.accessToken}`
          }
        });
      } catch (error: unknown) {
        lastError = error;

        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        const isRetryable = !status || status >= 500 || status === 429;

        this.logger.warn("HubSpot request failed", {
          operationName,
          attempt,
          status,
          retrying: isRetryable && attempt < this.config.retries
        });

        if (!isRetryable || attempt >= this.config.retries) {
          break;
        }
      }
    }

    this.logger.error("HubSpot request exhausted retries", {
      operationName,
      retries: this.config.retries,
      error: lastError instanceof Error ? lastError.message : "Unknown error"
    });

    throw new AppError("HubSpot API request failed after retries", StatusCodes.BAD_GATEWAY);
  }
}
