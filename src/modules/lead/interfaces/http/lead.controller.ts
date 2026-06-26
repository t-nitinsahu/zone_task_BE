import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

import type { LeadService } from "../../application/LeadService.js";

export class LeadController {
  public constructor(private readonly service: LeadService) {}

  public createLead = async (request: Request, response: Response): Promise<void> => {
    const lead = await this.service.createLead(request.body);

    response.status(StatusCodes.CREATED).json({
      success: true,
      message: "Lead created successfully",
      data: lead
    });
  };

  public listLeads = async (_request: Request, response: Response): Promise<void> => {
    const leads = await this.service.listLeads();

    response.status(StatusCodes.OK).json({
      success: true,
      message: "Leads fetched successfully",
      data: leads,
      meta: {
        count: leads.length
      }
    });
  };

  public getDashboardStats = async (_request: Request, response: Response): Promise<void> => {
    const stats = await this.service.getDashboardStats();

    response.status(StatusCodes.OK).json({
      success: true,
      message: "Dashboard statistics fetched successfully",
      data: stats
    });
  };
}
