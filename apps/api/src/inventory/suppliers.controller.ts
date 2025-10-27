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
  CreateSupplierDto,
  UpdateSupplierDto,
  SupplierQueryDto,
} from './dto/supplier.dto';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('inventory/suppliers')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SuppliersController {
  constructor() {}

  @Post()
  @RequirePermissions('inventory.create', 'SUPPLIER_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new supplier' })
  @ApiResponse({ status: 201, description: 'Supplier created successfully' })
  create(@Body() createDto: CreateSupplierDto, @TenantId() tenantId: string) {
    return {
      success: true,
      message: 'Supplier created successfully',
      data: {
        id: 'sup-' + Date.now(),
        ...createDto,
        tenantId,
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Get()
  @RequirePermissions('inventory.view', 'SUPPLIER_READ')
  @ApiOperation({ summary: 'Get all suppliers' })
  @ApiResponse({ status: 200, description: 'Suppliers retrieved successfully' })
  findAll(@TenantId() tenantId: string, @Query() query: SupplierQueryDto) {
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
  @RequirePermissions('inventory.view', 'SUPPLIER_READ')
  @ApiOperation({ summary: 'Get supplier by ID' })
  @ApiResponse({ status: 200, description: 'Supplier retrieved successfully' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return {
      success: true,
      data: {
        id,
        tenantId,
        isActive: true,
      },
    };
  }

  @Patch(':id')
  @RequirePermissions('inventory.update', 'SUPPLIER_UPDATE')
  @ApiOperation({ summary: 'Update supplier' })
  @ApiResponse({ status: 200, description: 'Supplier updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSupplierDto,
    @TenantId() tenantId: string,
  ) {
    return {
      success: true,
      message: 'Supplier updated successfully',
      data: { id, ...updateDto, tenantId },
    };
  }

  @Delete(':id')
  @RequirePermissions('inventory.delete', 'SUPPLIER_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete supplier' })
  @ApiResponse({ status: 204, description: 'Supplier deleted successfully' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return;
  }
}
