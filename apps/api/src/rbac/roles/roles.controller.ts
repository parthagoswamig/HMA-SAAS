import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RequirePermissions } from '../decorators/require-permissions.decorator';
import { PermissionsGuard } from '../guards/permissions.guard';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @RequirePermissions('roles.create')
  async create(@Request() req, @Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(req.user.tenantId, createRoleDto, req.user.userId);
  }

  @Get()
  @RequirePermissions('roles.view')
  async findAll(@Request() req) {
    return this.rolesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  @RequirePermissions('roles.view')
  async findOne(@Request() req, @Param('id') id: string) {
    return this.rolesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  @RequirePermissions('roles.update')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(req.user.tenantId, id, updateRoleDto, req.user.userId);
  }

  @Delete(':id')
  @RequirePermissions('roles.delete')
  async remove(@Request() req, @Param('id') id: string) {
    return this.rolesService.remove(req.user.tenantId, id, req.user.userId);
  }

  @Get(':id/permissions')
  @RequirePermissions('roles.view')
  async getRolePermissions(@Request() req, @Param('id') id: string) {
    return this.rolesService.getRolePermissions(req.user.tenantId, id);
  }

  @Post(':roleId/assign/:userId')
  @RequirePermissions('roles.manage')
  async assignRoleToUser(
    @Request() req,
    @Param('roleId') roleId: string,
    @Param('userId') userId: string,
  ) {
    return this.rolesService.assignRoleToUser(
      req.user.tenantId,
      userId,
      roleId,
      req.user.userId,
    );
  }

  @Delete('remove/:userId')
  @RequirePermissions('roles.manage')
  async removeRoleFromUser(@Request() req, @Param('userId') userId: string) {
    return this.rolesService.removeRoleFromUser(req.user.tenantId, userId, req.user.userId);
  }
}
