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
  HttpCode,
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
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';
import {
  CreateLabTestDto,
  UpdateLabTestDto,
  CreateLabOrderDto,
  UpdateLabOrderDto,
  UpdateTestResultDto,
  PathologyFilterDto,
} from './dto';

@ApiTags('Pathology & Laboratory')
@ApiBearerAuth()
@Controller('pathology')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PathologyController {
  constructor(private readonly pathologyService: PathologyService) {}

  // Lab Tests
  @Post('tests')
  @RequirePermissions('pathology.create', 'PATHOLOGY_CREATE', 'LAB_TEST_CREATE')
  @HttpCode(HttpStatus.CREATED)
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
  @RequirePermissions('pathology.view', 'PATHOLOGY_READ', 'VIEW_LAB_TESTS')
  @ApiOperation({ summary: 'Get all laboratory tests with filtering' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Laboratory tests retrieved successfully',
  })
  findAllTests(@TenantId() tenantId: string, @Query() query: PathologyFilterDto) {
    return this.pathologyService.findAllTests(tenantId, query);
  }

  @Get('tests/:id')
  @RequirePermissions('pathology.view', 'PATHOLOGY_READ', 'VIEW_LAB_TESTS')
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
  @RequirePermissions('pathology.update', 'PATHOLOGY_UPDATE', 'LAB_TEST_UPDATE')
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
  @RequirePermissions('pathology.delete', 'PATHOLOGY_DELETE', 'LAB_TEST_DELETE')
  @HttpCode(HttpStatus.NO_CONTENT)
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
  @RequirePermissions('pathology.order.create', 'LAB_ORDER_CREATE', 'CREATE_LAB_ORDERS')
  @HttpCode(HttpStatus.CREATED)
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
  @RequirePermissions('pathology.order.view', 'LAB_ORDER_READ', 'VIEW_LAB_ORDERS')
  @ApiOperation({ summary: 'Get all laboratory orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Laboratory orders retrieved successfully',
  })
  findAllOrders(@TenantId() tenantId: string, @Query() query: PathologyFilterDto) {
    return this.pathologyService.findAllOrders(tenantId, query);
  }

  @Get('orders/:id')
  @RequirePermissions('pathology.order.view', 'LAB_ORDER_READ', 'VIEW_LAB_ORDERS')
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
  @RequirePermissions('pathology.order.update', 'LAB_ORDER_UPDATE', 'UPDATE_LAB_ORDERS')
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
  @RequirePermissions('pathology.order.delete', 'LAB_ORDER_DELETE', 'CANCEL_LAB_ORDERS')
  @HttpCode(HttpStatus.NO_CONTENT)
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
  @RequirePermissions('pathology.result.update', 'LAB_RESULT_UPDATE', 'UPDATE_LAB_RESULTS')
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
  @RequirePermissions('pathology.view', 'PATHOLOGY_READ', 'VIEW_REPORTS')
  @ApiOperation({ summary: 'Get pathology statistics and analytics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pathology statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: string) {
    return this.pathologyService.getStats(tenantId);
  }
}
