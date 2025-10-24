import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { CommunicationsService } from './communications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { UserId } from '../shared/decorators/user-id.decorator';
import {
  CreateMessageDto,
  CreateNotificationDto,
  MessageQueryDto,
  NotificationQueryDto,
} from './dto/communications.dto';

@ApiTags('Communications')
@ApiBearerAuth()
@Controller('communications')
@UseGuards(JwtAuthGuard)
export class CommunicationsController {
  constructor(private readonly service: CommunicationsService) {}

  // ==================== MESSAGE ENDPOINTS ====================

  @Post('messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message', description: 'Send a message to another user' })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 404, description: 'Recipient not found' })
  sendMessage(
    @Body() createDto: CreateMessageDto,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.service.sendMessage(createDto, tenantId, userId);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages', description: 'Get all messages for the current user' })
  @ApiResponse({ status: 200, description: 'Messages retrieved successfully' })
  getMessages(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query() query: MessageQueryDto,
  ) {
    return this.service.getMessages(tenantId, userId, query);
  }

  @Patch('messages/:id/read')
  @ApiOperation({ summary: 'Mark message as read', description: 'Mark a specific message as read' })
  @ApiResponse({ status: 200, description: 'Message marked as read' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  markAsRead(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.service.markAsRead(id, tenantId, userId);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Delete message', description: 'Delete a message' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  deleteMessage(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.service.deleteMessage(id, tenantId, userId);
  }

  // ==================== NOTIFICATION ENDPOINTS ====================

  @Post('notifications')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create notification', description: 'Create a new notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  createNotification(
    @Body() createDto: CreateNotificationDto,
    @TenantId() tenantId: string,
  ) {
    return this.service.createNotification(createDto, tenantId);
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get notifications', description: 'Get all notifications for the current user' })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  getNotifications(
    @TenantId() tenantId: string,
    @UserId() userId: string,
    @Query() query: NotificationQueryDto,
  ) {
    return this.service.getNotifications(tenantId, userId, query);
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark notification as read', description: 'Mark a specific notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  markNotificationAsRead(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.service.markNotificationAsRead(id, tenantId, userId);
  }

  @Patch('notifications/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read', description: 'Mark all notifications as read for the current user' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  markAllNotificationsAsRead(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.service.markAllNotificationsAsRead(tenantId, userId);
  }

  @Delete('notifications/:id')
  @ApiOperation({ summary: 'Delete notification', description: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiResponse({ status: 404, description: 'Notification not found' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  deleteNotification(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.service.deleteNotification(id, tenantId, userId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get communication statistics', description: 'Get message and notification statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(
    @TenantId() tenantId: string,
    @UserId() userId: string,
  ) {
    return this.service.getStats(tenantId, userId);
  }
}
