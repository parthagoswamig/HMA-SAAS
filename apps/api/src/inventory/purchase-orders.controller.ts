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
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import {
  CreatePurchaseOrderDto,
  UpdatePurchaseOrderDto,
  PurchaseOrderQueryDto,
} from './dto/purchase-order.dto';

@ApiTags('Purchase Orders')
@ApiBearerAuth()
@Controller('inventory/purchase-orders')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PurchaseOrdersController {
  constructor() {}

  @Post()
  @RequirePermissions('inventory.create', 'PURCHASE_ORDER_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new purchase order' })
  @ApiResponse({ status: 201, description: 'Purchase order created successfully' })
  create(@Body() createDto: CreatePurchaseOrderDto, @TenantId() tenantId: string) {
    // Mock response for now
    return {
      success: true,
      message: 'Purchase order created successfully',
      data: {
        id: 'po-' + Date.now(),
        ...createDto,
        tenantId,
        status: createDto.status || 'PENDING',
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Get()
  @RequirePermissions('inventory.view', 'PURCHASE_ORDER_READ')
  @ApiOperation({ summary: 'Get all purchase orders' })
  @ApiResponse({ status: 200, description: 'Purchase orders retrieved successfully' })
  findAll(@TenantId() tenantId: string, @Query() query: PurchaseOrderQueryDto) {
    // Mock response
    return {
      success: true,
      data: {
        items: [],
        pagination: {
          total: 0,
          page: query.page || 1,
          limit: query.limit || 10,
          pages: 0,
        },
      },
    };
  }

  @Get(':id')
  @RequirePermissions('inventory.view', 'PURCHASE_ORDER_READ')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  @ApiResponse({ status: 200, description: 'Purchase order retrieved successfully' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return {
      success: true,
      data: {
        id,
        tenantId,
        status: 'PENDING',
      },
    };
  }

  @Patch(':id')
  @RequirePermissions('inventory.update', 'PURCHASE_ORDER_UPDATE')
  @ApiOperation({ summary: 'Update purchase order' })
  @ApiResponse({ status: 200, description: 'Purchase order updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePurchaseOrderDto,
    @TenantId() tenantId: string,
  ) {
    return {
      success: true,
      message: 'Purchase order updated successfully',
      data: { id, ...updateDto, tenantId },
    };
  }

  @Delete(':id')
  @RequirePermissions('inventory.delete', 'PURCHASE_ORDER_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel purchase order' })
  @ApiResponse({ status: 204, description: 'Purchase order cancelled successfully' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return;
  }
}
