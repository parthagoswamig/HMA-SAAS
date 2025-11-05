import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import {
  CreateMedicationDto,
  UpdateMedicationDto,
  CreatePharmacyOrderDto,
  UpdatePharmacyOrderDto,
  UpdatePharmacyOrderItemDto,
  PharmacyOrderQueryDto,
  MedicationQueryDto,
  PharmacyOrderStatus,
} from './dto/pharmacy.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PharmacyService {
  private readonly logger = new Logger(PharmacyService.name);

  constructor(private prisma: CustomPrismaService) {}

  // ==================== Helper Methods ====================

  /**
   * Build where clause for medication queries
   */
  private buildMedicationWhereClause(tenantId: string, query: MedicationQueryDto): Prisma.MedicationWhereInput {
    const { search, dosageForm, isActive = true } = query;
    
    const where: Prisma.MedicationWhereInput = {
      tenantId,
      isActive,
    };

    if (dosageForm) {
      where.dosageForm = dosageForm;
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { genericName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return where;
  }

  /**
   * Build where clause for pharmacy order queries
   */
  private buildPharmacyOrderWhereClause(tenantId: string, query: PharmacyOrderQueryDto): Prisma.PharmacyOrderWhereInput {
    const { search, status, startDate, endDate, patientId, doctorId } = query;
    
    const where: Prisma.PharmacyOrderWhereInput = {
      tenantId,
    };

    if (status) {
      where.status = status;
    }

    if (patientId) {
      where.patientId = patientId;
    }

    if (doctorId) {
      where.doctorId = doctorId;
    }

    if (startDate || endDate) {
      where.orderDate = {};
      if (startDate) {
        where.orderDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.orderDate.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        {
          patient: {
            OR: [
              { firstName: { contains: search } },
              { lastName: { contains: search } },
              { medicalRecordNumber: { contains: search } },
            ],
          },
        },
      ];
    }

    return where;
  }

  /**
   * Get pharmacy order include options
   */
  private getPharmacyOrderIncludes() {
    return {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          medicalRecordNumber: true,
        },
      },
      doctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          specialization: true,
        },
      },
      items: {
        include: {
          medication: true,
        },
      },
    };
  }

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(page: any, limit: any): { page: number; limit: number } {
    const validatedPage = Math.max(1, parseInt(page?.toString() || '1', 10));
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit?.toString() || '10', 10)));
    
    return { page: validatedPage, limit: validatedLimit };
  }

  // ==================== Medication Management ====================

  async createMedication(
    createMedicationDto: CreateMedicationDto,
    tenantId: string,
  ) {
    try {
      this.logger.log(`Creating medication for tenant: ${tenantId}`);
      
      const medication = await this.prisma.medication.create({
        data: {
          ...createMedicationDto,
          tenantId,
        },
      });

      this.logger.log(`Successfully created medication with ID: ${medication.id}`);
      return {
        success: true,
        message: 'Medication added successfully',
        data: medication,
      };
    } catch (error) {
      this.logger.error('Error creating medication:', error.message, error.stack);
      throw new BadRequestException(
        error.message || 'Failed to add medication',
      );
    }
  }

  async findAllMedications(tenantId: string, query: MedicationQueryDto = {}) {
    try {
      this.logger.log(`Finding medications for tenant: ${tenantId} with query:`, query);
      
      const { page: rawPage, limit: rawLimit } = query;
      const { page, limit } = this.validatePaginationParams(rawPage, rawLimit);
      const skip = (page - 1) * limit;

      const where = this.buildMedicationWhereClause(tenantId, query);

      const [medications, total] = await Promise.all([
        this.prisma.medication.findMany({
          where,
          skip,
          take: limit,
          orderBy: { name: 'asc' },
        }),
        this.prisma.medication.count({ where }),
      ]);

      this.logger.log(`Found ${medications.length} medications out of ${total} total`);
      return {
        success: true,
        data: {
          medications,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error finding medications:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch medications');
    }
  }

  async findOneMedication(id: string, tenantId: string) {
    try {
      this.logger.log(`Finding medication with ID: ${id} for tenant: ${tenantId}`);
      
      const medication = await this.prisma.medication.findFirst({
        where: { id, tenantId },
      });

      if (!medication) {
        this.logger.warn(`Medication not found with ID: ${id} for tenant: ${tenantId}`);
        throw new NotFoundException('Medication not found');
      }

      this.logger.log(`Successfully found medication: ${medication.name}`);
      return {
        success: true,
        data: medication,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding medication:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch medication');
    }
  }

  async updateMedication(
    id: string,
    updateMedicationDto: UpdateMedicationDto,
    tenantId: string,
  ) {
    try {
      this.logger.log(`Updating medication with ID: ${id} for tenant: ${tenantId}`);
      
      const medication = await this.prisma.medication.update({
        where: { id, tenantId },
        data: updateMedicationDto,
      });

      this.logger.log(`Successfully updated medication: ${medication.name}`);
      return {
        success: true,
        message: 'Medication updated successfully',
        data: medication,
      };
    } catch (error) {
      this.logger.error('Error updating medication:', error.message, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException('Medication not found');
      }
      throw new BadRequestException('Failed to update medication');
    }
  }

  async removeMedication(id: string, tenantId: string) {
    try {
      this.logger.log(`Deactivating medication with ID: ${id} for tenant: ${tenantId}`);
      
      await this.prisma.medication.update({
        where: { id, tenantId },
        data: { isActive: false },
      });

      this.logger.log(`Successfully deactivated medication with ID: ${id}`);
      return {
        success: true,
        message: 'Medication deactivated successfully',
      };
    } catch (error) {
      this.logger.error('Error removing medication:', error.message, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException('Medication not found');
      }
      throw new BadRequestException('Failed to deactivate medication');
    }
  }

  // ==================== Pharmacy Orders Management ====================

  async createPharmacyOrder(
    createPharmacyOrderDto: CreatePharmacyOrderDto,
    tenantId: string,
  ) {
    try {
      this.logger.log(`Creating pharmacy order for tenant: ${tenantId}, patient: ${createPharmacyOrderDto.patientId}`);
      
      // Generate order number
      const orderNumber = await this.generateOrderNumber(tenantId);
      this.logger.log(`Generated order number: ${orderNumber}`);

      // Create pharmacy order with items
      const pharmacyOrder = await this.prisma.pharmacyOrder.create({
        data: {
          orderNumber,
          patientId: createPharmacyOrderDto.patientId,
          doctorId: createPharmacyOrderDto.doctorId,
          notes: createPharmacyOrderDto.notes,
          status: PharmacyOrderStatus.PENDING,
          tenantId,
          items: {
            create: createPharmacyOrderDto.items.map((item) => ({
              medicationId: item.medicationId,
              quantity: item.quantity,
              dosage: item.dosage,
              frequency: item.frequency,
              duration: item.duration,
              instructions: item.instructions,
              status: PharmacyOrderStatus.PENDING,
              tenantId,
            })),
          },
        },
        include: this.getPharmacyOrderIncludes(),
      });

      this.logger.log(`Successfully created pharmacy order with ID: ${pharmacyOrder.id}, order number: ${orderNumber}`);
      return {
        success: true,
        message: 'Pharmacy order created successfully',
        data: pharmacyOrder,
      };
    } catch (error) {
      this.logger.error('Error creating pharmacy order:', error.message, error.stack);
      throw new BadRequestException(
        error.message || 'Failed to create pharmacy order',
      );
    }
  }

  async findAllPharmacyOrders(
    tenantId: string,
    query: PharmacyOrderQueryDto = {},
  ) {
    try {
      this.logger.log(`Finding pharmacy orders for tenant: ${tenantId} with query:`, query);
      
      const { page: rawPage, limit: rawLimit } = query;
      const { page, limit } = this.validatePaginationParams(rawPage, rawLimit);
      const skip = (page - 1) * limit;

      const where = this.buildPharmacyOrderWhereClause(tenantId, query);

      const [orders, total] = await Promise.all([
        this.prisma.pharmacyOrder.findMany({
          where,
          skip,
          take: limit,
          orderBy: { orderDate: 'desc' },
          include: {
            ...this.getPharmacyOrderIncludes(),
            patient: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                medicalRecordNumber: true,
                dateOfBirth: true,
                gender: true,
              },
            },
          },
        }),
        this.prisma.pharmacyOrder.count({ where }),
      ]);

      this.logger.log(`Found ${orders.length} pharmacy orders out of ${total} total`);
      return {
        success: true,
        data: {
          orders,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error finding pharmacy orders:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch pharmacy orders');
    }
  }

  async findOnePharmacyOrder(id: string, tenantId: string) {
    try {
      this.logger.log(`Finding pharmacy order with ID: ${id} for tenant: ${tenantId}`);
      
      const order = await this.prisma.pharmacyOrder.findFirst({
        where: { id, tenantId },
        include: {
          ...this.getPharmacyOrderIncludes(),
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              medicalRecordNumber: true,
              dateOfBirth: true,
              gender: true,
              phone: true,
              email: true,
            },
          },
          doctor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialization: true,
              licenseNumber: true,
            },
          },
        },
      });

      if (!order) {
        this.logger.warn(`Pharmacy order not found with ID: ${id} for tenant: ${tenantId}`);
        throw new NotFoundException('Pharmacy order not found');
      }

      this.logger.log(`Successfully found pharmacy order: ${order.orderNumber}`);
      return {
        success: true,
        data: order,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding pharmacy order:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch pharmacy order');
    }
  }

  async updatePharmacyOrder(
    id: string,
    updatePharmacyOrderDto: UpdatePharmacyOrderDto,
    tenantId: string,
  ) {
    try {
      this.logger.log(`Updating pharmacy order with ID: ${id} for tenant: ${tenantId}`);
      
      const order = await this.prisma.pharmacyOrder.update({
        where: { id, tenantId },
        data: {
          ...updatePharmacyOrderDto,
          dispensedDate: updatePharmacyOrderDto.dispensedDate
            ? new Date(updatePharmacyOrderDto.dispensedDate)
            : undefined,
        },
        include: this.getPharmacyOrderIncludes(),
      });

      this.logger.log(`Successfully updated pharmacy order: ${order.orderNumber}`);
      return {
        success: true,
        message: 'Pharmacy order updated successfully',
        data: order,
      };
    } catch (error) {
      this.logger.error('Error updating pharmacy order:', error.message, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException('Pharmacy order not found');
      }
      throw new BadRequestException('Failed to update pharmacy order');
    }
  }

  async updatePharmacyOrderItem(
    orderId: string,
    itemId: string,
    updateItemDto: UpdatePharmacyOrderItemDto,
    tenantId: string,
  ) {
    try {
      this.logger.log(`Updating pharmacy order item with ID: ${itemId} for order: ${orderId}, tenant: ${tenantId}`);
      
      // Find the specific pharmacy order item
      const item = await this.prisma.pharmacyOrderItem.findFirst({
        where: {
          id: itemId,
          orderId,
          tenantId,
        },
      });

      if (!item) {
        this.logger.warn(`Pharmacy order item not found with ID: ${itemId} for order: ${orderId}`);
        throw new NotFoundException('Pharmacy order item not found');
      }

      // Update the item
      const updatedItem = await this.prisma.pharmacyOrderItem.update({
        where: { id: itemId },
        data: updateItemDto,
        include: {
          medication: true,
        },
      });

      // Check if all items are dispensed
      const allItems = await this.prisma.pharmacyOrderItem.findMany({
        where: { orderId, tenantId },
      });

      const allDispensed = allItems.every((i) => i.status === PharmacyOrderStatus.DISPENSED);
      const someDispensed = allItems.some((i) => i.status === PharmacyOrderStatus.DISPENSED);

      // Update order status accordingly
      if (allDispensed) {
        await this.prisma.pharmacyOrder.update({
          where: { id: orderId },
          data: {
            status: PharmacyOrderStatus.DISPENSED,
            dispensedDate: new Date(),
          },
        });
        this.logger.log(`Updated order ${orderId} status to DISPENSED - all items dispensed`);
      } else if (someDispensed) {
        await this.prisma.pharmacyOrder.update({
          where: { id: orderId },
          data: { status: PharmacyOrderStatus.PARTIALLY_DISPENSED },
        });
        this.logger.log(`Updated order ${orderId} status to PARTIALLY_DISPENSED`);
      }

      this.logger.log(`Successfully updated pharmacy order item: ${itemId}`);
      return {
        success: true,
        message: 'Pharmacy order item updated successfully',
        data: updatedItem,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating pharmacy order item:', error.message, error.stack);
      throw new BadRequestException(
        error.message || 'Failed to update pharmacy order item',
      );
    }
  }

  async cancelPharmacyOrder(id: string, tenantId: string) {
    try {
      this.logger.log(`Cancelling pharmacy order with ID: ${id} for tenant: ${tenantId}`);
      
      await this.prisma.pharmacyOrder.update({
        where: { id, tenantId },
        data: { status: PharmacyOrderStatus.CANCELLED },
      });

      this.logger.log(`Successfully cancelled pharmacy order with ID: ${id}`);
      return {
        success: true,
        message: 'Pharmacy order cancelled successfully',
      };
    } catch (error) {
      this.logger.error('Error cancelling pharmacy order:', error.message, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException('Pharmacy order not found');
      }
      throw new BadRequestException('Failed to cancel pharmacy order');
    }
  }

  async getPharmacyStats(tenantId: string) {
    try {
      this.logger.log(`Getting pharmacy stats for tenant: ${tenantId}`);
      
      const [
        totalOrders,
        pendingOrders,
        dispensedOrders,
        completedOrders,
        cancelledOrders,
        totalMedications,
        activeMedications,
        todayOrders,
      ] = await Promise.all([
        this.prisma.pharmacyOrder.count({ where: { tenantId } }),
        this.prisma.pharmacyOrder.count({
          where: { tenantId, status: PharmacyOrderStatus.PENDING },
        }),
        this.prisma.pharmacyOrder.count({
          where: { tenantId, status: PharmacyOrderStatus.DISPENSED },
        }),
        this.prisma.pharmacyOrder.count({
          where: { tenantId, status: PharmacyOrderStatus.COMPLETED },
        }),
        this.prisma.pharmacyOrder.count({
          where: { tenantId, status: PharmacyOrderStatus.CANCELLED },
        }),
        this.prisma.medication.count({ where: { tenantId } }),
        this.prisma.medication.count({ where: { tenantId, isActive: true } }),
        this.prisma.pharmacyOrder.count({
          where: {
            tenantId,
            orderDate: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
      ]);

      this.logger.log(`Successfully retrieved pharmacy stats for tenant: ${tenantId}`);
      return {
        success: true,
        data: {
          totalOrders,
          pendingOrders,
          dispensedOrders,
          completedOrders,
          cancelledOrders,
          totalMedications,
          activeMedications,
          todayOrders,
        },
      };
    } catch (error) {
      this.logger.error('Error getting pharmacy stats:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch pharmacy statistics');
    }
  }

  private async generateOrderNumber(tenantId: string): Promise<string> {
    try {
      const count = await this.prisma.pharmacyOrder.count({
        where: { tenantId },
      });
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const orderNumber = `PH${year}${month}${String(count + 1).padStart(5, '0')}`;
      
      this.logger.log(`Generated order number: ${orderNumber} for tenant: ${tenantId}`);
      return orderNumber;
    } catch (error) {
      this.logger.error('Error generating order number:', error.message, error.stack);
      throw new BadRequestException('Failed to generate order number');
    }
  }
}
