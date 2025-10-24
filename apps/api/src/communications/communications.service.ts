import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import {
  CreateMessageDto,
  CreateNotificationDto,
  MessageQueryDto,
  NotificationQueryDto,
  MessagePriority,
  NotificationType,
} from './dto/communications.dto';

@Injectable()
export class CommunicationsService {
  private readonly logger = new Logger(CommunicationsService.name);

  constructor(private prisma: CustomPrismaService) {}

  /**
   * Send a message
   */
  async sendMessage(createDto: CreateMessageDto, tenantId: string, senderId: string) {
    try {
      // Verify recipient exists
      const recipient = await this.prisma.user.findFirst({
        where: { id: createDto.recipientId, tenantId },
      });

      if (!recipient) {
        throw new NotFoundException('Recipient not found');
      }

      const message = await this.prisma.message.create({
        data: {
          senderId,
          recipientId: createDto.recipientId,
          subject: createDto.subject,
          body: createDto.content,
          priority: createDto.priority || MessagePriority.NORMAL,
          read: false,
          tenantId,
        },
      });

      this.logger.log(`Message sent from ${senderId} to ${createDto.recipientId}`);
      return { success: true, message: 'Message sent successfully', data: message };
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get messages for a user
   */
  async getMessages(tenantId: string, userId: string, query: MessageQueryDto) {
    try {
      const { page = 1, limit = 10, read, priority, search } = query;
      const skip = (page - 1) * limit;

      const where: any = {
        tenantId,
        OR: [{ senderId: userId }, { recipientId: userId }],
      };

      if (read !== undefined) {
        where.read = read;
      }

      if (priority) {
        where.priority = priority;
      }

      if (search) {
        where.OR = [
          { subject: { contains: search, mode: 'insensitive' } },
          { body: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [messages, total] = await Promise.all([
        this.prisma.message.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.message.count({ where }),
      ]);

      return {
        success: true,
        data: messages,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get messages: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch messages');
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(id: string, tenantId: string, userId: string) {
    try {
      const message = await this.prisma.message.findFirst({
        where: { id, tenantId, recipientId: userId },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      const updated = await this.prisma.message.update({
        where: { id },
        data: { read: true },
      });

      this.logger.log(`Message ${id} marked as read by ${userId}`);
      return { success: true, message: 'Message marked as read', data: updated };
    } catch (error) {
      this.logger.error(`Failed to mark message as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(id: string, tenantId: string, userId: string) {
    try {
      const message = await this.prisma.message.findFirst({
        where: {
          id,
          tenantId,
          OR: [{ senderId: userId }, { recipientId: userId }],
        },
      });

      if (!message) {
        throw new NotFoundException('Message not found');
      }

      await this.prisma.message.delete({ where: { id } });

      this.logger.log(`Message ${id} deleted by ${userId}`);
      return { success: true, message: 'Message deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete message: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Create a notification
   */
  async createNotification(createDto: CreateNotificationDto, tenantId: string) {
    try {
      // Verify user exists
      const user = await this.prisma.user.findFirst({
        where: { id: createDto.userId, tenantId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const notification = await this.prisma.notification.create({
        data: {
          userId: createDto.userId,
          title: createDto.title,
          message: createDto.message,
          type: createDto.type || NotificationType.INFO,
          actionUrl: createDto.actionUrl,
          read: false,
          tenantId,
        },
      });

      this.logger.log(`Notification created for user ${createDto.userId}`);
      return {
        success: true,
        message: 'Notification created successfully',
        data: notification,
      };
    } catch (error) {
      this.logger.error(`Failed to create notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(tenantId: string, userId: string, query: NotificationQueryDto) {
    try {
      const { page = 1, limit = 10, read, type } = query;
      const skip = (page - 1) * limit;

      const where: any = { tenantId, userId };

      if (read !== undefined) {
        where.read = read;
      }

      if (type) {
        where.type = type;
      }

      const [notifications, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.notification.count({ where }),
      ]);

      return {
        success: true,
        data: notifications,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get notifications: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch notifications');
    }
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(id: string, tenantId: string, userId: string) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: { id, tenantId, userId },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      const updated = await this.prisma.notification.update({
        where: { id },
        data: { read: true },
      });

      this.logger.log(`Notification ${id} marked as read by ${userId}`);
      return {
        success: true,
        message: 'Notification marked as read',
        data: updated,
      };
    } catch (error) {
      this.logger.error(`Failed to mark notification as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(tenantId: string, userId: string) {
    try {
      const result = await this.prisma.notification.updateMany({
        where: { tenantId, userId, read: false },
        data: { read: true },
      });

      this.logger.log(`${result.count} notifications marked as read for user ${userId}`);
      return {
        success: true,
        message: `${result.count} notifications marked as read`,
        data: { count: result.count },
      };
    } catch (error) {
      this.logger.error(`Failed to mark all notifications as read: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  async deleteNotification(id: string, tenantId: string, userId: string) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: { id, tenantId, userId },
      });

      if (!notification) {
        throw new NotFoundException('Notification not found');
      }

      await this.prisma.notification.delete({ where: { id } });

      this.logger.log(`Notification ${id} deleted by ${userId}`);
      return { success: true, message: 'Notification deleted successfully' };
    } catch (error) {
      this.logger.error(`Failed to delete notification: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get communication statistics
   */
  async getStats(tenantId: string, userId: string) {
    try {
      const [
        unreadMessages,
        totalMessages,
        unreadNotifications,
        totalNotifications,
        sentMessages,
        receivedMessages,
      ] = await Promise.all([
        this.prisma.message.count({
          where: { tenantId, recipientId: userId, read: false },
        }),
        this.prisma.message.count({
          where: {
            tenantId,
            OR: [{ senderId: userId }, { recipientId: userId }],
          },
        }),
        this.prisma.notification.count({
          where: { tenantId, userId, read: false },
        }),
        this.prisma.notification.count({
          where: { tenantId, userId },
        }),
        this.prisma.message.count({
          where: { tenantId, senderId: userId },
        }),
        this.prisma.message.count({
          where: { tenantId, recipientId: userId },
        }),
      ]);

      return {
        success: true,
        data: {
          unreadMessages,
          totalMessages,
          unreadNotifications,
          totalNotifications,
          sentMessages,
          receivedMessages,
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get stats: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to fetch statistics');
    }
  }
}
