export const createSwaggerSpec = () => {
  return {
    openapi: "3.0.3",
    info: {
      title: "Zone Task API",
      version: "1.0.0",
      description: "API documentation for leads, dashboard stats, and HubSpot integration."
    },
    tags: [
      { name: "Leads", description: "Lead management endpoints" },
      { name: "Dashboard", description: "Dashboard analytics endpoints" },
      { name: "HubSpot", description: "HubSpot integration endpoints" }
    ],
    paths: {
      "/api/leads": {
        post: {
          tags: ["Leads"],
          summary: "Create a lead",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateLeadRequest" }
              }
            }
          },
          responses: {
            "201": {
              description: "Lead created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LeadCreateResponse" }
                }
              }
            },
            "400": {
              description: "Validation failed"
            },
            "409": {
              description: "Duplicate lead"
            }
          }
        },
        get: {
          tags: ["Leads"],
          summary: "List leads",
          responses: {
            "200": {
              description: "Leads fetched",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/LeadListResponse" }
                }
              }
            }
          }
        }
      },
      "/api/dashboard/stats": {
        get: {
          tags: ["Dashboard"],
          summary: "Get dashboard statistics",
          responses: {
            "200": {
              description: "Stats fetched",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/DashboardStatsResponse" }
                }
              }
            }
          }
        }
      },
      "/api/hubspot/status": {
        get: {
          tags: ["HubSpot"],
          summary: "HubSpot health check",
          responses: {
            "200": {
              description: "HubSpot healthy",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HubspotStatusResponse" }
                }
              }
            },
            "503": {
              description: "HubSpot unavailable or not configured",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/HubspotStatusResponse" }
                }
              }
            }
          }
        }
      }
    },
    components: {
      schemas: {
        CreateLeadRequest: {
          type: "object",
          required: ["firstName", "lastName", "email", "company", "budget"],
          properties: {
            firstName: { type: "string", example: "Ava" },
            lastName: { type: "string", example: "Turner" },
            email: { type: "string", format: "email", example: "ava.turner@northstar.io" },
            company: { type: "string", example: "Northstar Labs" },
            budget: { type: "number", example: 25000 },
            hubspotContactId: { type: "string", example: "hs_10001" },
            localStatus: {
              type: "string",
              enum: ["NEW", "QUALIFIED", "CONTACTED", "WON", "LOST", "ARCHIVED"]
            },
            hubspotStatus: {
              type: "string",
              enum: ["PENDING_SYNC", "SYNCED", "FAILED"]
            }
          }
        },
        Lead: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            firstName: { type: "string" },
            lastName: { type: "string" },
            email: { type: "string", format: "email" },
            company: { type: "string", nullable: true },
            budget: { type: "number", nullable: true },
            estimatedValue: { type: "number", nullable: true },
            hubspotContactId: { type: "string", nullable: true },
            localStatus: {
              type: "string",
              enum: ["NEW", "QUALIFIED", "CONTACTED", "WON", "LOST", "ARCHIVED"]
            },
            hubspotStatus: {
              type: "string",
              enum: ["PENDING_SYNC", "SYNCED", "FAILED"]
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        LeadCreateResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Lead created successfully" },
            data: { $ref: "#/components/schemas/Lead" }
          }
        },
        LeadListResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Leads fetched successfully" },
            data: {
              type: "array",
              items: { $ref: "#/components/schemas/Lead" }
            },
            meta: {
              type: "object",
              properties: {
                count: { type: "number", example: 2 }
              }
            }
          }
        },
        DashboardStatsResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Dashboard statistics fetched successfully" },
            data: {
              type: "object",
              properties: {
                totalLeads: { type: "number", example: 20 },
                totalPipelineValue: { type: "number", example: 400000 },
                averagePipelineValue: { type: "number", example: 20000 },
                statusBreakdown: {
                  type: "object",
                  properties: {
                    NEW: { type: "number", example: 10 },
                    QUALIFIED: { type: "number", example: 5 },
                    CONTACTED: { type: "number", example: 2 },
                    WON: { type: "number", example: 2 },
                    LOST: { type: "number", example: 1 },
                    ARCHIVED: { type: "number", example: 0 }
                  }
                }
              }
            }
          }
        },
        HubspotStatusResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "HubSpot API reachable" },
            data: {
              type: "object",
              properties: {
                service: { type: "string", example: "hubspot" },
                ok: { type: "boolean", example: true },
                configured: { type: "boolean", example: true },
                retries: { type: "number", example: 3 },
                details: { type: "string", example: "HubSpot API reachable" }
              }
            }
          }
        }
      }
    }
  };
};
