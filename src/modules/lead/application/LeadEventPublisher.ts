import type { LeadRecord } from "../domain/Lead.js";

export interface LeadEventPublisher {
  emitLeadCreated(lead: LeadRecord): void;
  emitHubspotSynced(lead: LeadRecord): void;
}

export class NoopLeadEventPublisher implements LeadEventPublisher {
  public emitLeadCreated(_lead: LeadRecord): void {}

  public emitHubspotSynced(_lead: LeadRecord): void {}
}
