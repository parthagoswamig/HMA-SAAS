import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ValidationPipe,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
  ChangeUserPasswordDto,
  AssignRoleDto,
} from './dto/user.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { CurrentUser } from '../shared/decorators/current-user.decorator';

@ApiTags('User Management')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @RequirePermissions('user.create', 'USER_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@TenantId() tenantId: string, @Body(ValidationPipe) createDto: CreateUserDto) {
    return this.usersService.create(tenantId, createDto);
  }

  @Get()
  @RequirePermissions('user.view', 'USER_READ', 'VIEW_USERS')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(@TenantId() tenantId: string, @Query(ValidationPipe) query: UserQueryDto) {
    return this.usersService.findAll(tenantId, query);
  }

  @Get('stats')
  @RequirePermissions('user.view', 'USER_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getStats(@TenantId() tenantId: string) {
    return this.usersService.getUserStats(tenantId);
  }

  @Get(':id')
  @RequirePermissions('user.view', 'USER_READ', 'VIEW_USERS')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.usersService.findOne(tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('user.update', 'USER_UPDATE')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateUserDto,
  ) {
    return this.usersService.update(tenantId, id, updateDto);
  }

  @Delete(':id')
  @RequirePermissions('user.delete', 'USER_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 204, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async delete(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.usersService.delete(tenantId, id);
  }

  @Post(':id/change-password')
  @RequirePermissions('user.update', 'USER_UPDATE', 'CHANGE_PASSWORD')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Change user password' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Password changed successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async changePassword(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: ChangeUserPasswordDto,
  ) {
    return this.usersService.changePassword(tenantId, id, dto);
  }

  @Post(':id/assign-role')
  @RequirePermissions('role.assign', 'ROLE_ASSIGN', 'MANAGE_ROLES')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Assign role to user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async assignRole(
    @TenantId() tenantId: string,
    @Param('id') id: string,
    @Body(ValidationPipe) dto: AssignRoleDto,
  ) {
    return this.usersService.assignRole(tenantId, id, dto);
  }
}
