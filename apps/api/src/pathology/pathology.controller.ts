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
import { PathologyService } from './pathology.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TenantId } from '../shared/decorators/tenant-id.decorator';
import {
  CreateLabTestDto,
  UpdateLabTestDto,
  CreateLabOrderDto,
  UpdateLabOrderDto,
  UpdateTestResultDto,
  PathologyFilterDto,
} from './dto';

@ApiTags('Pathology & Laboratory')
@Controller('pathology')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PathologyController {
  constructor(private readonly pathologyService: PathologyService) {}

  // Lab Tests
  @Post('tests')
  @ApiOperation({ summary: 'Create a new laboratory test' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Laboratory test created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  createTest(@Body() createDto: CreateLabTestDto, @TenantId() tenantId: string) {
    return this.pathologyService.createTest(createDto, tenantId);
  }

  @Get('tests')
  @ApiOperation({ summary: 'Get all laboratory tests with filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Laboratory tests retrieved successfully',
  })
  findAllTests(@TenantId() tenantId: string, @Query() query: PathologyFilterDto) {
    return this.pathologyService.findAllTests(tenantId, query);
  }

  @Get('tests/:id')
  @ApiOperation({ summary: 'Get a specific laboratory test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Laboratory test retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Test not found',
  })
  findOneTest(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.pathologyService.findOneTest(id, tenantId);
  }

  @Patch('tests/:id')
  @ApiOperation({ summary: 'Update a laboratory test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Laboratory test updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Test not found',
  })
  updateTest(
    @Param('id') id: string,
    @Body() updateDto: UpdateLabTestDto,
    @TenantId() tenantId: string,
  ) {
    return this.pathologyService.updateTest(id, updateDto, tenantId);
  }

  @Delete('tests/:id')
  @ApiOperation({ summary: 'Soft delete a laboratory test' })
  @ApiParam({ name: 'id', description: 'Test ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Laboratory test deleted successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Test not found',
  })
  removeTest(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.pathologyService.removeTest(id, tenantId);
  }

  // Lab Orders
  @Post('orders')
  @ApiOperation({ summary: 'Create a new laboratory order' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Laboratory order created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request data',
  })
  createOrder(@Body() createDto: CreateLabOrderDto, @TenantId() tenantId: string) {
    return this.pathologyService.createOrder(createDto, tenantId);
  }

  @Get('orders')
  @ApiOperation({ summary: 'Get all laboratory orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Laboratory orders retrieved successfully',
  })
  findAllOrders(@TenantId() tenantId: string, @Query() query: PathologyFilterDto) {
    return this.pathologyService.findAllOrders(tenantId, query);
  }

  @Get('orders/:id')
  @ApiOperation({ summary: 'Get a specific laboratory order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Laboratory order retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  findOneOrder(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.pathologyService.findOneOrder(id, tenantId);
  }

  @Patch('orders/:id')
  @ApiOperation({ summary: 'Update a laboratory order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Laboratory order updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  updateOrder(
    @Param('id') id: string,
    @Body() updateDto: UpdateLabOrderDto,
    @TenantId() tenantId: string,
  ) {
    return this.pathologyService.updateOrder(id, updateDto, tenantId);
  }

  @Delete('orders/:id')
  @ApiOperation({ summary: 'Cancel a laboratory order' })
  @ApiParam({ name: 'id', description: 'Order ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Laboratory order cancelled successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order not found',
  })
  removeOrder(@Param('id') id: string, @TenantId() tenantId: string) {
    return this.pathologyService.removeOrder(id, tenantId);
  }

  @Patch('orders/:orderId/tests/:testId/result')
  @ApiOperation({ summary: 'Update test result in a laboratory order' })
  @ApiParam({ name: 'orderId', description: 'Order ID' })
  @ApiParam({ name: 'testId', description: 'Test ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Test result updated successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Order or test not found',
  })
  updateTestResult(
    @Param('orderId') orderId: string,
    @Param('testId') testId: string,
    @Body() resultDto: UpdateTestResultDto,
    @TenantId() tenantId: string,
  ) {
    return this.pathologyService.updateTestResult(
      orderId,
      testId,
      resultDto,
      tenantId,
    );
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get pathology statistics and analytics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pathology statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: string) {
    return this.pathologyService.getStats(tenantId);
  }
}
