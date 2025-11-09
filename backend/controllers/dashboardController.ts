import { Response, NextFunction } from 'express';
import { prisma } from '../prismaClient.js';
import { AuthRequest } from '../types/index.js';
import { LeadStatus, ActivityType } from '@prisma/client';

export const getDashboardStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const where: any = {};
    
    // Sales execs can only see their own stats
    if (userRole === 'SALES_EXEC') {
      where.ownerId = userId;
    }

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      qualifiedLeads,
      wonLeads,
      lostLeads,
      totalActivities,
      leadsByStatus,
      activitiesByType,
      recentLeads,
      recentActivities,
    ] = await Promise.all([
      // Total leads
      prisma.lead.count({ where }),
      
      // Leads by status
      prisma.lead.count({ where: { ...where, status: LeadStatus.NEW } }),
      prisma.lead.count({ where: { ...where, status: LeadStatus.CONTACTED } }),
      prisma.lead.count({ where: { ...where, status: LeadStatus.QUALIFIED } }),
      prisma.lead.count({ where: { ...where, status: LeadStatus.WON } }),
      prisma.lead.count({ where: { ...where, status: LeadStatus.LOST } }),
      
      // Total activities
      prisma.activity.count({
        where: userRole === 'SALES_EXEC' 
          ? { lead: { ownerId: userId } }
          : {},
      }),
      
      // Leads by status (for chart)
      prisma.lead.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
      
      // Activities by type (for chart)
      prisma.activity.groupBy({
        by: ['type'],
        where: userRole === 'SALES_EXEC' 
          ? { lead: { ownerId: userId } }
          : {},
        _count: { type: true },
      }),
      
      // Recent leads
      prisma.lead.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      
      // Recent activities
      prisma.activity.findMany({
        where: userRole === 'SALES_EXEC' 
          ? { lead: { ownerId: userId } }
          : {},
        include: {
          lead: {
            select: {
              id: true,
              title: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Format data for charts
    const leadsByStatusData = leadsByStatus.map((item) => ({
      status: item.status,
      count: item._count.status,
    }));

    const activitiesByTypeData = activitiesByType.map((item) => ({
      type: item.type,
      count: item._count.type,
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalLeads,
          newLeads,
          contactedLeads,
          qualifiedLeads,
          wonLeads,
          lostLeads,
          totalActivities,
        },
        charts: {
          leadsByStatus: leadsByStatusData,
          activitiesByType: activitiesByTypeData,
        },
        recentLeads,
        recentActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};
