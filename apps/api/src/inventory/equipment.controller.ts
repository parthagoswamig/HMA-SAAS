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
  CreateEquipmentDto,
  UpdateEquipmentDto,
  EquipmentQueryDto,
} from './dto/equipment.dto';

@ApiTags('Equipment')
@ApiBearerAuth()
@Controller('inventory/equipment')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class EquipmentController {
  constructor() {}

  @Post()
  @RequirePermissions('inventory.create', 'EQUIPMENT_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add new equipment' })
  @ApiResponse({ status: 201, description: 'Equipment added successfully' })
  create(@Body() createDto: CreateEquipmentDto, @TenantId() tenantId: string) {
    return {
      success: true,
      message: 'Equipment added successfully',
      data: {
        id: 'eq-' + Date.now(),
        ...createDto,
        tenantId,
        status: createDto.status || 'OPERATIONAL',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    };
  }

  @Get()
  @RequirePermissions('inventory.view', 'EQUIPMENT_READ')
  @ApiOperation({ summary: 'Get all equipment' })
  @ApiResponse({ status: 200, description: 'Equipment retrieved successfully' })
  findAll(@TenantId() tenantId: string, @Query() query: EquipmentQueryDto) {
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
  @RequirePermissions('inventory.view', 'EQUIPMENT_READ')
  @ApiOperation({ summary: 'Get equipment by ID' })
  @ApiResponse({ status: 200, description: 'Equipment retrieved successfully' })
  findOne(@Param('id') id: string, @TenantId() tenantId: string) {
    return {
      success: true,
      data: {
        id,
        tenantId,
        status: 'OPERATIONAL',
      },
    };
  }

  @Patch(':id')
  @RequirePermissions('inventory.update', 'EQUIPMENT_UPDATE')
  @ApiOperation({ summary: 'Update equipment' })
  @ApiResponse({ status: 200, description: 'Equipment updated successfully' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEquipmentDto,
    @TenantId() tenantId: string,
  ) {
    return {
      success: true,
      message: 'Equipment updated successfully',
      data: { id, ...updateDto, tenantId },
    };
  }

  @Delete(':id')
  @RequirePermissions('inventory.delete', 'EQUIPMENT_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove equipment' })
  @ApiResponse({ status: 204, description: 'Equipment removed successfully' })
  remove(@Param('id') id: string, @TenantId() tenantId: string) {
    return;
  }
}
