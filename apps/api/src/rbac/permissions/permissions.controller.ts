import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { PermissionsService } from './permissions.service';
import { RequirePermissions } from '../decorators/require-permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @RequirePermissions('roles.view')
  async findAll() {
    return this.permissionsService.findAll();
  }

  @Get('categories')
  @RequirePermissions('roles.view')
  async getCategories() {
    return this.permissionsService.getCategories();
  }

  @Get('category/:category')
  @RequirePermissions('roles.view')
  async findByCategory(@Param('category') category: string) {
    return this.permissionsService.findByCategory(category);
  }

  @Get(':id')
  @RequirePermissions('roles.view')
  async findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }
}
