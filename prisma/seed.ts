import { HubspotStatus, LeadStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const seed = async (): Promise<void> => {
  const leads = [
    {
      firstName: "Ava",
      lastName: "Turner",
      email: "ava.turner@northstar.io",
      company: "Northstar Labs",
      budget: "25000.00",
      estimatedValue: "42000.00",
      hubspotContactId: "hs_10001",
      localStatus: LeadStatus.QUALIFIED,
      hubspotStatus: HubspotStatus.SYNCED
    },
    {
      firstName: "Liam",
      lastName: "Garcia",
      email: "liam.garcia@horizon.ai",
      company: "Horizon AI",
      budget: "10000.00",
      estimatedValue: "18000.00",
      hubspotContactId: "hs_10002",
      localStatus: LeadStatus.NEW,
      hubspotStatus: HubspotStatus.PENDING_SYNC
    }
  ] as const;

  for (const lead of leads) {
    await prisma.lead.upsert({
      where: { email: lead.email },
      update: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        company: lead.company,
        budget: lead.budget,
        estimatedValue: lead.estimatedValue,
        hubspotContactId: lead.hubspotContactId,
        localStatus: lead.localStatus,
        hubspotStatus: lead.hubspotStatus
      },
      create: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        company: lead.company,
        budget: lead.budget,
        estimatedValue: lead.estimatedValue,
        hubspotContactId: lead.hubspotContactId,
        localStatus: lead.localStatus,
        hubspotStatus: lead.hubspotStatus
      }
    });
  }
};

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Seeding failed", error);
    await prisma.$disconnect();
    process.exit(1);
  });
