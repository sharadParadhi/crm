import { Response, NextFunction } from 'express';
import { prisma } from '../prismaClient.js';
import { AuthRequest, CreateLeadDto, UpdateLeadDto } from '../types/index.js';
import { NotFoundError, ValidationError, ForbiddenError } from '../utils/errors.js';
import { NotificationService } from '../services/notificationService.js';
import { EmailService } from '../services/emailService.js';
import { emitToUser, emitToLead, emitToAll } from '../socketServer.js';
import { ActivityType, LeadStatus } from '@prisma/client';

export const getLeads = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { status, ownerId, page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    // Sales execs can only see their own leads
    if (userRole === 'SALES_EXEC') {
      where.ownerId = userId;
    } else if (ownerId) {
      where.ownerId = parseInt(ownerId as string);
    }
    
    if (status) {
      where.status = status;
    }

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          activities: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              activities: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({
      success: true,
      data: leads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(id) },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        activities: {
          include: {
            creator: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        history: {
          include: {
            changer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Sales execs can only view their own leads
    if (userRole === 'SALES_EXEC' && lead.ownerId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const createLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const data: CreateLeadDto = req.body;

    if (!data.title) {
      throw new ValidationError('Title is required');
    }

    // Sales execs can only assign leads to themselves
    if (userRole === 'SALES_EXEC') {
      data.ownerId = userId;
    }

    const lead = await prisma.lead.create({
      data: {
        title: data.title,
        company: data.company,
        email: data.email,
        phone: data.phone,
        status: data.status || LeadStatus.NEW,
        ownerId: data.ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Create activity for lead creation
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        type: ActivityType.NOTE,
        note: 'Lead created',
        createdBy: userId!,
      },
    });

    // Send notification and email if owner is assigned
    if (lead.ownerId && lead.owner) {
      await NotificationService.createNotification(
        lead.ownerId,
        'New Lead Assigned',
        `A new lead "${lead.title}" has been assigned to you.`,
        'info'
      );
      
      // Emit real-time notification
      emitToUser(lead.ownerId, 'notification', {
        title: 'New Lead Assigned',
        message: `A new lead "${lead.title}" has been assigned to you.`,
        type: 'info',
      });
      
      if (lead.owner.email) {
        await EmailService.sendLeadAssignmentNotification(
          lead.owner.email,
          lead.title,
          lead.id
        );
      }
    }
    
    // Emit lead creation event
    emitToAll('lead:created', lead);

    res.status(201).json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const data: UpdateLeadDto = req.body;

    const existingLead = await prisma.lead.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingLead) {
      throw new NotFoundError('Lead not found');
    }

    // Sales execs can only update their own leads
    if (userRole === 'SALES_EXEC' && existingLead.ownerId !== userId) {
      throw new ForbiddenError('Access denied');
    }

    // Track status changes
    if (data.status && data.status !== existingLead.status) {
      await prisma.leadHistory.create({
        data: {
          leadId: existingLead.id,
          from: existingLead.status,
          to: data.status,
          changedBy: userId!,
        },
      });

      // Create activity for status change
      await prisma.activity.create({
        data: {
          leadId: existingLead.id,
          type: ActivityType.STATUS_CHANGE,
          note: `Status changed from ${existingLead.status} to ${data.status}`,
          createdBy: userId!,
        },
      });

      // Send notification if owner exists
      if (existingLead.ownerId) {
        const owner = await prisma.user.findUnique({
          where: { id: existingLead.ownerId },
        });

        if (owner) {
          await NotificationService.createNotification(
            owner.id,
            'Lead Status Updated',
            `Lead "${existingLead.title}" status changed to ${data.status}`,
            'info'
          );
          
          // Emit real-time notification
          emitToUser(owner.id, 'notification', {
            title: 'Lead Status Updated',
            message: `Lead "${existingLead.title}" status changed to ${data.status}`,
            type: 'info',
          });

          if (owner.email) {
            await EmailService.sendLeadStatusChangeNotification(
              owner.email,
              existingLead.title,
              existingLead.status,
              data.status
            );
          }
        }
      }
      
      // Emit status change to lead room
      emitToLead(existingLead.id, 'lead:statusChanged', {
        leadId: existingLead.id,
        from: existingLead.status,
        to: data.status,
      });
    }

    // Track owner changes
    if (data.ownerId && data.ownerId !== existingLead.ownerId) {
      const newOwner = await prisma.user.findUnique({
        where: { id: data.ownerId },
      });

      if (newOwner) {
        await NotificationService.createNotification(
          data.ownerId,
          'New Lead Assigned',
          `Lead "${existingLead.title}" has been assigned to you.`,
          'info'
        );
        
        // Emit real-time notification
        emitToUser(data.ownerId, 'notification', {
          title: 'New Lead Assigned',
          message: `Lead "${existingLead.title}" has been assigned to you.`,
          type: 'info',
        });

        if (newOwner.email) {
          await EmailService.sendLeadAssignmentNotification(
            newOwner.email,
            existingLead.title,
            existingLead.id
          );
        }
      }
      
      // Emit owner change to lead room
      emitToLead(existingLead.id, 'lead:ownerChanged', {
        leadId: existingLead.id,
        newOwnerId: data.ownerId,
      });
    }

    const lead = await prisma.lead.update({
      where: { id: parseInt(id) },
      data,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    // Emit lead update event
    emitToLead(lead.id, 'lead:updated', lead);

    res.json({
      success: true,
      data: lead,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    const lead = await prisma.lead.findUnique({
      where: { id: parseInt(id) },
    });

    if (!lead) {
      throw new NotFoundError('Lead not found');
    }

    // Only admins and managers can delete leads
    if (userRole === 'SALES_EXEC') {
      throw new ForbiddenError('Access denied');
    }

    await prisma.lead.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
