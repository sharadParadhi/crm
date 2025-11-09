import { prisma } from '../prismaClient.js';
import { logger } from '../utils/logger.js';

export class NotificationService {
  static async createNotification(
    userId: number,
    title: string,
    message: string,
    type: string = 'info'
  ) {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
  }

  static async getNotifications(userId: number, read?: boolean) {
    return await prisma.notification.findMany({
      where: {
        userId,
        ...(read !== undefined && { read }),
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  static async markAsRead(notificationId: number, userId: number) {
    return await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
      },
    });
  }

  static async markAllAsRead(userId: number) {
    return await prisma.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
      },
    });
  }
}
