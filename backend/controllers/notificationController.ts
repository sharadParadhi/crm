import { Response, NextFunction } from 'express';
import { prisma } from '../prismaClient.js';
import { AuthRequest } from '../types/index.js';
import { NotFoundError } from '../utils/errors.js';
import { NotificationService } from '../services/notificationService.js';

export const getNotifications = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { read } = req.query;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const notifications = await NotificationService.getNotifications(
      userId,
      read === 'true' ? true : read === 'false' ? false : undefined
    );

    res.json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    const result = await NotificationService.markAsRead(parseInt(id), userId);

    if (result.count === 0) {
      throw new NotFoundError('Notification not found');
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new Error('User not authenticated');
    }

    await NotificationService.markAllAsRead(userId);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
