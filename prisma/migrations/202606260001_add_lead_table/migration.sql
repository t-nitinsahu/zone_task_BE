-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'QUALIFIED', 'CONTACTED', 'WON', 'LOST', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "HubspotStatus" AS ENUM ('PENDING_SYNC', 'SYNCED', 'FAILED');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "company" TEXT,
    "budget" DECIMAL(14,2),
    "estimatedValue" DECIMAL(14,2),
    "hubspotContactId" TEXT,
    "localStatus" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "hubspotStatus" "HubspotStatus" NOT NULL DEFAULT 'PENDING_SYNC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_email_key" ON "Lead"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_hubspotContactId_key" ON "Lead"("hubspotContactId");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "Lead_localStatus_idx" ON "Lead"("localStatus");

-- CreateIndex
CREATE INDEX "Lead_hubspotStatus_idx" ON "Lead"("hubspotStatus");
