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
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { RadiologyService } from './radiology.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import {
  CreateStudyDto,
  UpdateStudyDto,
  CreateReportDto,
  UpdateReportDto,
  CreateRadiologyOrderDto,
  UpdateRadiologyOrderDto,
  RadiologyFilterDto,
} from './dto';

@ApiTags('Radiology & Imaging')
@Controller('radiology')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RadiologyController {
  constructor(private readonly radiologyService: RadiologyService) {}

  // Studies
  @Post('studies')
  @ApiOperation({ summary: 'Create a new radiology study' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Radiology study created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  createStudy(@Body() createDto: CreateStudyDto, @TenantId() tenantId: string) {
    return this.radiologyService.createStudy(createDto, tenantId);
  }

  @Get('studies')
  @ApiOperation({ summary: 'Get all radiology studies with filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology studies retrieved successfully',
  })
  findAllStudies(@TenantId() tenantId: string, @Query() query: RadiologyFilterDto) {
    return this.radiologyService.findAllStudies(tenantId, query);
  }

  @Get('studies/:id')
  @ApiOperation({ summary: 'Get a specific radiology study' })
  @ApiParam({ name: 'id', description: 'Study ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology study retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Study not found',
  })
  findOneStudy(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.radiologyService.findOneStudy(id, tenantId);
  }

  @Patch('studies/:id')
  @ApiOperation({ summary: 'Update a radiology study' })
  @ApiParam({ name: 'id', description: 'Study ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology study updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Study not found',
  })
  updateStudy(
    @Param('id') id: string,
    @Body() updateDto: UpdateStudyDto,
    @TenantId() tenantId: string,
  ) {
    return this.radiologyService.updateStudy(id, updateDto, tenantId);
  }

  @Delete('studies/:id')
  @ApiOperation({ summary: 'Soft delete a radiology study' })
  @ApiParam({ name: 'id', description: 'Study ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology study deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Study not found',
  })
  removeStudy(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.radiologyService.removeStudy(id, tenantId);
  }

  // Reports
  @Post('reports')
  @ApiOperation({ summary: 'Create a radiology report' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Radiology report created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  createReport(@Body() createDto: CreateReportDto, @TenantId() tenantId: string) {
    return this.radiologyService.createReport(createDto, tenantId);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get all radiology reports' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology reports retrieved successfully',
  })
  findAllReports(@TenantId() tenantId: string, @Query() query: RadiologyFilterDto) {
    return this.radiologyService.findAllReports(tenantId, query);
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Get a specific radiology report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology report retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Report not found',
  })
  findOneReport(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.radiologyService.findOneReport(id, tenantId);
  }

  @Patch('reports/:id')
  @ApiOperation({ summary: 'Update a radiology report' })
  @ApiParam({ name: 'id', description: 'Report ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology report updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Report not found',
  })
  updateReport(
    @Param('id') id: string,
    @Body() updateDto: UpdateReportDto,
    @TenantId() tenantId: string,
  ) {
    return this.radiologyService.updateReport(id, updateDto, tenantId);
  }

  // Orders
  @Post('orders')
  @ApiOperation({ summary: 'Create a radiology order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Radiology order created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  createOrder(@Body() createDto: CreateRadiologyOrderDto, @TenantId() tenantId: string) {
    return this.radiologyService.createOrder(createDto, tenantId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all radiology orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology orders retrieved successfully',
  })
  findAllOrders(@TenantId() tenantId: string, @Query() query: RadiologyFilterDto) {
    return this.radiologyService.findAllOrders(tenantId, query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get a specific radiology order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology order retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  findOneOrder(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.radiologyService.findOneOrder(id, tenantId);
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update a radiology order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology order updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  updateOrder(
    @Param('id') id: string,
    @Body() updateDto: UpdateRadiologyOrderDto,
    @TenantId() tenantId: string,
  ) {
    return this.radiologyService.updateOrder(id, updateDto, tenantId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get radiology statistics and analytics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Radiology statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: string) {
    return this.radiologyService.getStats(tenantId);
  }
}
