import type { LeadForHubSpot, HubSpotCreateOrUpdatePayload } from "./hubspot.types.js";

const toFixedString = (value: number | null): string | undefined => {
  if (value === null) {
    return undefined;
  }

  return value.toFixed(2);
};

export const mapLeadToHubSpotPayload = (lead: LeadForHubSpot): HubSpotCreateOrUpdatePayload => {
  const payload: HubSpotCreateOrUpdatePayload = {
    properties: {
      email: lead.email,
      firstname: lead.firstName,
      lastname: lead.lastName
    }
  };

  if (lead.company) {
    payload.properties.company = lead.company;
  }

  const budget = toFixedString(lead.budget);
  if (budget) {
    payload.properties.budget = budget;
  }

  const estimatedPipelineValue = toFixedString(lead.estimatedValue);
  if (estimatedPipelineValue) {
    payload.properties.estimated_pipeline_value = estimatedPipelineValue;
  }

  return payload;
};
