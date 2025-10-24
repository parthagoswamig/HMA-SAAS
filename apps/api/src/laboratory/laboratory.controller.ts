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
import { LaboratoryService } from './laboratory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateLabTestDto,
  UpdateLabTestDto,
  CreateLabOrderDto,
  UpdateLabOrderDto,
  UpdateLabTestResultDto,
  LabOrderQueryDto,
  LabTestQueryDto,
} from './dto';
import { TenantId } from '../shared/decorators/tenant-id.decorator';

@ApiTags('Laboratory')
@ApiBearerAuth()
@Controller('laboratory')
@UseGuards(JwtAuthGuard)
export class LaboratoryController {
  constructor(private readonly laboratoryService: LaboratoryService) {}

  // ==================== Lab Tests Endpoints ====================

  @Post('tests')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lab test' })
  @ApiResponse({ status: 201, description: 'Lab test created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createLabTest(
    @Body() createLabTestDto: CreateLabTestDto,
    @TenantId() tenantId: string,
  ) {
    return this.laboratoryService.createLabTest(createLabTestDto, tenantId);
  }

  @Get('tests')
  @ApiOperation({ summary: 'Get all lab tests with pagination' })
  @ApiResponse({ status: 200, description: 'Lab tests retrieved successfully' })
  async findAllLabTests(
    @TenantId() tenantId: string,
    @Query() query: LabTestQueryDto,
  ) {
    return this.laboratoryService.findAllLabTests(tenantId, query);
  }

  @Get('tests/:id')
  @ApiOperation({ summary: 'Get lab test by ID' })
  @ApiResponse({ status: 200, description: 'Lab test retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lab test not found' })
  async findOneLabTest(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.laboratoryService.findOneLabTest(id, tenantId);
  }

  @Patch('tests/:id')
  @ApiOperation({ summary: 'Update lab test by ID' })
  @ApiResponse({ status: 200, description: 'Lab test updated successfully' })
  @ApiResponse({ status: 404, description: 'Lab test not found' })
  async updateLabTest(
    @Param('id') id: string,
    @Body() updateLabTestDto: UpdateLabTestDto,
    @TenantId() tenantId: string,
  ) {
    return this.laboratoryService.updateLabTest(id, updateLabTestDto, tenantId);
  }

  @Delete('tests/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft delete lab test by ID' })
  @ApiResponse({ status: 204, description: 'Lab test deleted successfully' })
  @ApiResponse({ status: 404, description: 'Lab test not found' })
  async removeLabTest(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.laboratoryService.removeLabTest(id, tenantId);
  }

  // ==================== Lab Orders Endpoints ====================

  @Post('orders')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new lab order' })
  @ApiResponse({ status: 201, description: 'Lab order created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createLabOrder(
    @Body() createLabOrderDto: CreateLabOrderDto,
    @TenantId() tenantId: string,
  ) {
    return this.laboratoryService.createLabOrder(createLabOrderDto, tenantId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all lab orders with pagination' })
  @ApiResponse({ status: 200, description: 'Lab orders retrieved successfully' })
  async findAllLabOrders(
    @TenantId() tenantId: string,
    @Query() query: LabOrderQueryDto,
  ) {
    return this.laboratoryService.findAllLabOrders(tenantId, query);
  }

  @Get('orders/stats')
  @ApiOperation({ summary: 'Get laboratory statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getLabStats(@TenantId() tenantId: string) {
    return this.laboratoryService.getLabStats(tenantId);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get lab order by ID' })
  @ApiResponse({ status: 200, description: 'Lab order retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Lab order not found' })
  async findOneLabOrder(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.laboratoryService.findOneLabOrder(id, tenantId);
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update lab order by ID' })
  @ApiResponse({ status: 200, description: 'Lab order updated successfully' })
  @ApiResponse({ status: 404, description: 'Lab order not found' })
  async updateLabOrder(
    @Param('id') id: string,
    @Body() updateLabOrderDto: UpdateLabOrderDto,
    @TenantId() tenantId: string,
  ) {
    return this.laboratoryService.updateLabOrder(
      id,
      updateLabOrderDto,
      tenantId,
    );
  }

  @Patch('orders/:orderId/tests/:testId/result')
  @ApiOperation({ summary: 'Update lab test result' })
  @ApiResponse({ status: 200, description: 'Test result updated successfully' })
  @ApiResponse({ status: 404, description: 'Test or order not found' })
  async updateLabTestResult(
    @Param('orderId') orderId: string,
    @Param('testId') testId: string,
    @Body() updateResultDto: UpdateLabTestResultDto,
    @TenantId() tenantId: string,
  ) {
    return this.laboratoryService.updateLabTestResult(
      orderId,
      testId,
      updateResultDto,
      tenantId,
    );
  }

  @Delete('orders/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancel lab order by ID' })
  @ApiResponse({ status: 204, description: 'Lab order cancelled successfully' })
  @ApiResponse({ status: 404, description: 'Lab order not found' })
  async cancelLabOrder(
    @Param('id') id: string,
    @TenantId() tenantId: string,
  ) {
    return this.laboratoryService.cancelLabOrder(id, tenantId);
  }
}
