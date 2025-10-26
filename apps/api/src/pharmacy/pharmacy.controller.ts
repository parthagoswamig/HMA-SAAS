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
import { PharmacyService } from './pharmacy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import {
  CreateMedicationDto,
  UpdateMedicationDto,
  CreatePharmacyOrderDto,
  UpdatePharmacyOrderDto,
  UpdatePharmacyOrderItemDto,
  PharmacyOrderQueryDto,
  MedicationQueryDto,
} from './dto';

@ApiTags('Pharmacy')
@ApiBearerAuth()
@Controller('pharmacy')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PharmacyController {
  constructor(private readonly pharmacyService: PharmacyService) {}

  // ==================== Medications Endpoints ====================

  @Post('medications')
  @RequirePermissions('pharmacy.create', 'PHARMACY_CREATE', 'MEDICATION_CREATE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new medication' })
  @ApiResponse({ status: 201, description: 'Medication created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createMedication(
    @Body() createMedicationDto: CreateMedicationDto,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.createMedication(createMedicationDto, tenantId);
  }

  @Get('medications')
  @RequirePermissions('pharmacy.view', 'PHARMACY_READ', 'VIEW_PHARMACY')
  @ApiOperation({ summary: 'Get all medications with pagination' })
  @ApiResponse({ status: 200, description: 'Medications retrieved successfully' })
  async findAllMedications(
    @TenantId() tenantId: string,
    @Query() query: MedicationQueryDto,
  ) {
    return this.pharmacyService.findAllMedications(tenantId, query);
  }

  @Get('medications/:id')
  @RequirePermissions('pharmacy.view', 'PHARMACY_READ', 'VIEW_PHARMACY')
  @ApiOperation({ summary: 'Get medication by ID' })
  @ApiResponse({ status: 200, description: 'Medication retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async findOneMedication(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.findOneMedication(id, tenantId);
  }

  @Patch('medications/:id')
  @RequirePermissions('pharmacy.update', 'PHARMACY_UPDATE', 'MEDICATION_UPDATE')
  @ApiOperation({ summary: 'Update medication by ID' })
  @ApiResponse({ status: 200, description: 'Medication updated successfully' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async updateMedication(
    @Param('id') id: string,
    @Body() updateMedicationDto: UpdateMedicationDto,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.updateMedication(id, updateMedicationDto, tenantId);
  }

  @Delete('medications/:id')
  @RequirePermissions('pharmacy.delete', 'PHARMACY_DELETE', 'MEDICATION_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete medication by ID' })
  @ApiResponse({ status: 204, description: 'Medication deleted successfully' })
  @ApiResponse({ status: 404, description: 'Medication not found' })
  async removeMedication(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.removeMedication(id, tenantId);
  }

  // ==================== Pharmacy Orders Endpoints ====================

  @Post('orders')
  @RequirePermissions('pharmacy.order.create', 'PHARMACY_ORDER_CREATE', 'DISPENSE_MEDICATION')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new pharmacy order' })
  @ApiResponse({ status: 201, description: 'Pharmacy order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createPharmacyOrder(
    @Body() createPharmacyOrderDto: CreatePharmacyOrderDto,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.createPharmacyOrder(createPharmacyOrderDto, tenantId);
  }

  @Get('orders')
  @RequirePermissions('pharmacy.order.view', 'PHARMACY_ORDER_READ', 'VIEW_PHARMACY_ORDERS')
  @ApiOperation({ summary: 'Get all pharmacy orders with pagination' })
  @ApiResponse({ status: 200, description: 'Pharmacy orders retrieved successfully' })
  async findAllPharmacyOrders(
    @TenantId() tenantId: string,
    @Query() query: PharmacyOrderQueryDto,
  ) {
    return this.pharmacyService.findAllPharmacyOrders(tenantId, query);
  }

  @Get('orders/stats')
  @RequirePermissions('pharmacy.view', 'PHARMACY_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get pharmacy statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getPharmacyStats(@TenantId() tenantId: string) {
    return this.pharmacyService.getPharmacyStats(tenantId);
  }

  @Get('orders/:id')
  @RequirePermissions('pharmacy.order.view', 'PHARMACY_ORDER_READ', 'VIEW_PHARMACY_ORDERS')
  @ApiOperation({ summary: 'Get pharmacy order by ID' })
  @ApiResponse({ status: 200, description: 'Pharmacy order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Pharmacy order not found' })
  async findOnePharmacyOrder(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.findOnePharmacyOrder(id, tenantId);
  }

  @Patch('orders/:id')
  @RequirePermissions('pharmacy.order.update', 'PHARMACY_ORDER_UPDATE', 'DISPENSE_MEDICATION')
  @ApiOperation({ summary: 'Update pharmacy order by ID' })
  @ApiResponse({ status: 200, description: 'Pharmacy order updated successfully' })
  @ApiResponse({ status: 404, description: 'Pharmacy order not found' })
  async updatePharmacyOrder(
    @Param('id') id: string,
    @Body() updatePharmacyOrderDto: UpdatePharmacyOrderDto,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.updatePharmacyOrder(
      id,
      updatePharmacyOrderDto,
      tenantId,
    );
  }

  @Patch('orders/:orderId/items/:itemId')
  @RequirePermissions('pharmacy.order.update', 'PHARMACY_ORDER_UPDATE', 'DISPENSE_MEDICATION')
  @ApiOperation({ summary: 'Update pharmacy order item status' })
  @ApiResponse({ status: 200, description: 'Order item updated successfully' })
  @ApiResponse({ status: 404, description: 'Order or item not found' })
  async updatePharmacyOrderItem(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @Body() updateItemDto: UpdatePharmacyOrderItemDto,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.updatePharmacyOrderItem(
      orderId,
      itemId,
      updateItemDto,
      tenantId,
    );
  }

  @Delete('orders/:id')
  @RequirePermissions('pharmacy.order.delete', 'PHARMACY_ORDER_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel pharmacy order by ID' })
  @ApiResponse({ status: 204, description: 'Pharmacy order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Pharmacy order not found' })
  async cancelPharmacyOrder(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.pharmacyService.cancelPharmacyOrder(id, tenantId);
  }
}
