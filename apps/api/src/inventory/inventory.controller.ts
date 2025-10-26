import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
} from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';

@ApiTags('Inventory')
@ApiBearerAuth()
@Controller('inventory')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class InventoryController {
  constructor(private readonly service: InventoryService) {}

  @Post()
  @RequirePermissions('inventory.create', 'INVENTORY_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new inventory item' })
  @ApiResponse({ status: 201, description: 'Inventory item created successfully' })
  create(@Body() createDto: any, @TenantId() tenantId: string) {
    return this.service.create(createDto, tenantId);
  }

  @Get()
  @RequirePermissions('inventory.view', 'INVENTORY_READ', 'VIEW_INVENTORY')
  @ApiOperation({ summary: 'Get all inventory items' })
  @ApiResponse({ status: 200, description: 'Inventory items retrieved successfully' })
  findAll(@TenantId() tenantId: string, @Query() query: any) {
    return this.service.findAll(tenantId, query);
  }

  @Get('low-stock')
  @RequirePermissions('inventory.view', 'INVENTORY_READ', 'VIEW_INVENTORY')
  @ApiOperation({ summary: 'Get low stock items' })
  @ApiResponse({ status: 200, description: 'Low stock items retrieved successfully' })
  getLowStock(@TenantId() tenantId: string) {
    return this.service.getLowStock(tenantId);
  }

  @Get('stats')
  @RequirePermissions('inventory.view', 'INVENTORY_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get inventory statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  getStats(@TenantId() tenantId: string) {
    return this.service.getStats(tenantId);
  }

  @Get(':id')
  @RequirePermissions('inventory.view', 'INVENTORY_READ', 'VIEW_INVENTORY')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  @ApiResponse({ status: 200, description: 'Inventory item retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.findOne(id, tenantId);
  }

  @Patch(':id')
  @RequirePermissions('inventory.update', 'INVENTORY_UPDATE')
  @ApiOperation({ summary: 'Update inventory item' })
  @ApiResponse({ status: 200, description: 'Inventory item updated successfully' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  update(@Param('id') id: string, @Body() updateDto: any, @TenantId() tenantId: string) {
    return this.service.update(id, updateDto, tenantId);
  }

  @Patch(':id/adjust-stock')
  @RequirePermissions('inventory.update', 'INVENTORY_UPDATE', 'MANAGE_STOCK')
  @ApiOperation({ summary: 'Adjust inventory stock' })
  @ApiResponse({ status: 200, description: 'Stock adjusted successfully' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  adjustStock(
    @Param('id') id: string,
    @Body() adjustDto: { quantity: number },
    @TenantId() tenantId: string,
  ) {
    return this.service.adjustStock(id, adjustDto.quantity, tenantId);
  }

  @Delete(':id')
  @RequirePermissions('inventory.delete', 'INVENTORY_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete inventory item' })
  @ApiResponse({ status: 204, description: 'Inventory item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Inventory item not found' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.service.remove(id, tenantId);
  }
}
