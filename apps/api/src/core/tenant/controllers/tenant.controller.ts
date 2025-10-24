import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TenantService } from '../services/tenant.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../rbac/guards/roles.guard';
import { PermissionsGuard } from '../../rbac/guards/permissions.guard';
import { Roles } from '../../rbac/decorators/roles.decorator';
import { Permissions } from '../../rbac/decorators/permissions.decorator';
import { UserRole } from '../../rbac/enums/roles.enum';
import { Permission } from '../../rbac/enums/permissions.enum';
import {
  CreateTenantDto,
  UpdateTenantDto,
  UpdateSubscriptionDto,
  SuspendTenantDto,
} from '../dto/tenant.dto';
import { TenantStatus } from '../entities/tenant.entity';
import { Public } from '../../auth/guards/jwt-auth.guard';

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  /**
   * Create new tenant - Super Admin or Public for self-registration
   * POST /tenants
   */
  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateTenantDto) {
    return this.tenantService.create(createDto);
  }

  /**
   * Get all tenants - Super Admin only
   * GET /tenants
   */
  @Get()
  @Roles(UserRole.SUPER_ADMIN)
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: TenantStatus,
  ) {
    return this.tenantService.findAll(page, limit, status);
  }

  /**
   * Get tenant by ID - Super Admin or Tenant Admin
   * GET /tenants/:id
   */
  @Get(':id')
  @Permissions(Permission.VIEW_TENANT)
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantService.findOne(id);
  }

  /**
   * Get tenant by slug - Public (for login page tenant identification)
   * GET /tenants/slug/:slug
   */
  @Public()
  @Get('slug/:slug')
  async findBySlug(@Param('slug') slug: string) {
    return this.tenantService.findBySlug(slug);
  }

  /**
   * Update tenant - Tenant Admin or Super Admin
   * PATCH /tenants/:id
   */
  @Patch(':id')
  @Permissions(Permission.UPDATE_TENANT)
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateTenantDto,
  ) {
    return this.tenantService.update(id, updateDto);
  }

  /**
   * Activate tenant - Super Admin only
   * POST /tenants/:id/activate
   */
  @Post(':id/activate')
  @Roles(UserRole.SUPER_ADMIN)
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantService.activate(id);
  }

  /**
   * Suspend tenant - Super Admin only
   * POST /tenants/:id/suspend
   */
  @Post(':id/suspend')
  @Roles(UserRole.SUPER_ADMIN)
  async suspend(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() suspendDto: SuspendTenantDto,
  ) {
    return this.tenantService.suspend(id, suspendDto.reason);
  }

  /**
   * Deactivate tenant - Super Admin only
   * POST /tenants/:id/deactivate
   */
  @Post(':id/deactivate')
  @Roles(UserRole.SUPER_ADMIN)
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.tenantService.deactivate(id);
  }

  /**
   * Update subscription - Tenant Admin or Super Admin
   * PATCH /tenants/:id/subscription
   */
  @Patch(':id/subscription')
  @Permissions(Permission.MANAGE_TENANT_BILLING)
  async updateSubscription(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() subscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.tenantService.updateSubscription(
      id,
      subscriptionDto.plan,
      subscriptionDto.startDate,
      subscriptionDto.endDate,
    );
  }

  /**
   * Check resource limits - Tenant users
   * GET /tenants/:id/limits/:resource
   */
  @Get(':id/limits/:resource')
  @Permissions(Permission.VIEW_TENANT)
  async checkLimits(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('resource') resource: string,
  ) {
    return this.tenantService.checkLimits(id, resource);
  }

  /**
   * Soft delete tenant - Super Admin only
   * DELETE /tenants/:id
   */
  @Delete(':id')
  @Roles(UserRole.SUPER_ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.tenantService.remove(id);
  }
}
