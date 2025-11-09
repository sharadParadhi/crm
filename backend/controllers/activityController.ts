import { Response, NextFunction } from 'express';
import { prisma } from '../prismaClient.js';
import { AuthRequest, CreateActivityDto } from '../types/index.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
import { NotificationService } from '../services/notificationService.js';
import { EmailService } from '../services/emailService.js';
import { emitToUser, emitToLead } from '../socketServer.js';
import { ActivityType } from '@prisma/client';

export const getActivities = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { leadId } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const where: any = {};
    
    if (leadId) {
      const lead = await prisma.lead.findUnique({
        where: { id: parseInt(leadId as string) },
      });

      if (!lead) {
        throw new NotFoundError('Lead not found');
      }

      // Sales execs can only view activities for their own leads
      if (userRole === 'SALES_EXEC' && lead.ownerId !== userId) {
        throw new ForbiddenError('Access denied');
      }

      where.leadId = parseInt(leadId as string);
    }

    const activities = await prisma.activity.findMany({
      where,
      include: {
        lead: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const data: CreateActivityDto = req.body;

    if (!data.leadId || !data.type) {
      throw new ValidationError('Lead ID and activity type are required');
    }

    const lead = await prisma.lead.findUnique({
      where: { id: data.leadId },
      include: {
        owner: true,
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Sales execs can only add activities to their own leads
    if (userRole === 'SALES_EXEC' && lead.ownerId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    const activity = await prisma.activity.create({
      data: {
        leadId: data.leadId,
        type: data.type,
        note: data.note,
        meta: data.meta || {},
        createdBy: userId!,
      },
      include: {
        lead: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Send notification to lead owner if different from creator
    if (lead.ownerId && lead.ownerId !== userId && lead.owner) {
      await NotificationService.createNotification(
        lead.ownerId,
        'New Activity Added',
        `A new ${data.type.toLowerCase()} activity has been added to lead "${lead.title}".`,
        'info'
      );
      
      // Emit real-time notification
      emitToUser(lead.ownerId, 'notification', {
        title: 'New Activity Added',
        message: `A new ${data.type.toLowerCase()} activity has been added to lead "${lead.title}".`,
        type: 'info',
      });

      if (lead.owner.email) {
        await EmailService.sendActivityNotification(
          lead.owner.email,
          lead.title,
          data.type,
          data.note
        );
      }
    }
    
    // Emit activity creation to lead room
    emitToLead(data.leadId, 'activity:created', activity);

    res.status(201).json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivity = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const activity = await prisma.activity.findUnique({
      where: { id: parseInt(id) },
      include: {
        lead: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!activity) {
      throw new NotFoundError('Activity not found');
    }

    // Sales execs can only view activities for their own leads
    if (userRole === 'SALES_EXEC' && activity.lead.ownerId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    res.json({
      success: true,
      data: activity,
    });
  } catch (error) {
    next(error);
  }
};
