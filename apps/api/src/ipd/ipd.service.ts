import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateWardDto,
  UpdateWardDto,
  CreateBedDto,
  UpdateBedStatusDto,
  WardFilterDto,
  BedFilterDto,
  BedStatus,
  WardType,
} from './dto';

@Injectable()
export class IpdService {
  private readonly logger = new Logger(IpdService.name);

  constructor(private prisma: CustomPrismaService) {}

  // ==================== Helper Methods ====================

  /**
   * Get ward include options
   */
  private getWardIncludes() {
    return {
      beds: {
        orderBy: { bedNumber: 'asc' as const },
      },
      _count: {
        select: {
          beds: true,
        },
      },
    };
  }

  /**
   * Get bed include options
   */
  private getBedIncludes() {
    return {
      ward: {
        select: {
          id: true,
          name: true,
          type: true,
          location: true,
        },
      },
    };
  }

  /**
   * Build where clause for ward queries
   */
  private buildWardWhereClause(tenantId: string, filters: WardFilterDto): Prisma.WardWhereInput {
    const { type, search, isActive = true } = filters;
    
    const where: Prisma.WardWhereInput = {
      tenantId,
      isActive,
    };

    // Skip type filter for now as it's not in the Ward model
    // if (type) {
    //   where.type = type;
    // }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    return where;
  }

  /**
   * Build where clause for bed queries
   */
  private buildBedWhereClause(tenantId: string, filters: BedFilterDto): Prisma.BedWhereInput {
    const { wardId, status, search, isActive = true } = filters;
    
    const where: Prisma.BedWhereInput = {
      tenantId,
      isActive,
    };

    if (wardId) {
      where.wardId = wardId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { bedNumber: { contains: search } },
      ];
    }

    return where;
  }

  /**
   * Validate pagination parameters
   */
  private validatePaginationParams(page: any, limit: any): { page: number; limit: number } {
    const validatedPage = Math.max(1, parseInt(page?.toString() || '1', 10));
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit?.toString() || '10', 10)));
    
    return { page: validatedPage, limit: validatedLimit };
  }

  // ==================== Ward Management ====================

  /**
   * Create a new ward
   */
  async createWard(createWardDto: CreateWardDto, tenantId: string) {
    try {
      this.logger.log(`Creating ward: ${createWardDto.name} for tenant: ${tenantId}`);
      
      const ward = await this.prisma.ward.create({
        data: {
          ...createWardDto,
          tenantId,
        },
        include: this.getWardIncludes(),
      });

      this.logger.log(`Successfully created ward with ID: ${ward.id}`);
      return { 
        success: true, 
        message: 'Ward created successfully', 
        data: ward 
      };
    } catch (error) {
      this.logger.error('Error creating ward:', error.message, error.stack);
      throw new BadRequestException(
        error.message || 'Failed to create ward',
      );
    }
  }

  /**
   * Find all wards with filters
   */
  async findAllWards(tenantId: string, filters: WardFilterDto = {}) {
    try {
      this.logger.log(`Finding wards for tenant: ${tenantId} with filters:`, filters);
      
      const { page: rawPage, limit: rawLimit } = filters;
      const { page, limit } = this.validatePaginationParams(rawPage, rawLimit);
      const skip = (page - 1) * limit;

      const where = this.buildWardWhereClause(tenantId, filters);

      const [wards, total] = await Promise.all([
        this.prisma.ward.findMany({
          where,
          skip,
          take: limit,
          include: this.getWardIncludes(),
          orderBy: { name: 'asc' },
        }),
        this.prisma.ward.count({ where }),
      ]);

      this.logger.log(`Found ${wards.length} wards out of ${total} total`);
      return {
        success: true,
        data: {
          items: wards,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error finding wards:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch wards');
    }
  }

  /**
   * Find one ward by ID
   */
  async findOneWard(id: string, tenantId: string) {
    try {
      this.logger.log(`Finding ward with ID: ${id} for tenant: ${tenantId}`);
      
      const ward = await this.prisma.ward.findFirst({
        where: { id, tenantId, isActive: true },
        include: this.getWardIncludes(),
      });

      if (!ward) {
        this.logger.warn(`Ward not found with ID: ${id} for tenant: ${tenantId}`);
        throw new NotFoundException('Ward not found');
      }

      this.logger.log(`Successfully found ward: ${ward.name}`);
      return { success: true, data: ward };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error finding ward:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch ward');
    }
  }

  /**
   * Update ward
   */
  async updateWard(id: string, updateWardDto: UpdateWardDto, tenantId: string) {
    try {
      this.logger.log(`Updating ward with ID: ${id} for tenant: ${tenantId}`);
      
      const ward = await this.prisma.ward.findFirst({
        where: { id, tenantId, isActive: true },
      });

      if (!ward) {
        this.logger.warn(`Ward not found with ID: ${id} for tenant: ${tenantId}`);
        throw new NotFoundException('Ward not found');
      }

      const updated = await this.prisma.ward.update({
        where: { id },
        data: updateWardDto,
        include: this.getWardIncludes(),
      });

      this.logger.log(`Successfully updated ward: ${updated.name}`);
      return {
        success: true,
        message: 'Ward updated successfully',
        data: updated,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating ward:', error.message, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException('Ward not found');
      }
      throw new BadRequestException('Failed to update ward');
    }
  }

  // ==================== Bed Management ====================

  /**
   * Create a new bed
   */
  async createBed(createBedDto: CreateBedDto, tenantId: string) {
    try {
      this.logger.log(`Creating bed: ${createBedDto.bedNumber} in ward: ${createBedDto.wardId} for tenant: ${tenantId}`);
      
      // Verify ward exists
      const ward = await this.prisma.ward.findFirst({
        where: { id: createBedDto.wardId, tenantId, isActive: true },
      });
      if (!ward) {
        throw new NotFoundException('Ward not found');
      }

      const bed = await this.prisma.bed.create({
        data: {
          ...createBedDto,
          tenantId,
          status: createBedDto.status || BedStatus.AVAILABLE,
        },
        include: this.getBedIncludes(),
      });

      this.logger.log(`Successfully created bed with ID: ${bed.id}`);
      return { 
        success: true, 
        message: 'Bed created successfully', 
        data: bed 
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error creating bed:', error.message, error.stack);
      throw new BadRequestException(
        error.message || 'Failed to create bed',
      );
    }
  }

  /**
   * Find all beds with filters
   */
  async findAllBeds(tenantId: string, filters: BedFilterDto = {}) {
    try {
      this.logger.log(`Finding beds for tenant: ${tenantId} with filters:`, filters);
      
      const { page: rawPage, limit: rawLimit } = filters;
      const { page, limit } = this.validatePaginationParams(rawPage, rawLimit);
      const skip = (page - 1) * limit;

      const where = this.buildBedWhereClause(tenantId, filters);

      const [beds, total] = await Promise.all([
        this.prisma.bed.findMany({
          where,
          skip,
          take: limit,
          include: this.getBedIncludes(),
          orderBy: { bedNumber: 'asc' },
        }),
        this.prisma.bed.count({ where }),
      ]);

      this.logger.log(`Found ${beds.length} beds out of ${total} total`);
      return {
        success: true,
        data: {
          items: beds,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error finding beds:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch beds');
    }
  }

  /**
   * Find available beds
   */
  async findAvailableBeds(tenantId: string) {
    try {
      this.logger.log(`Finding available beds for tenant: ${tenantId}`);
      
      const beds = await this.prisma.bed.findMany({
        where: { 
          tenantId, 
          isActive: true, 
          status: BedStatus.AVAILABLE 
        },
        include: this.getBedIncludes(),
        orderBy: { bedNumber: 'asc' },
      });

      this.logger.log(`Found ${beds.length} available beds`);
      return { success: true, data: beds };
    } catch (error) {
      this.logger.error('Error finding available beds:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch available beds');
    }
  }

  /**
   * Update bed status
   */
  async updateBedStatus(id: string, updateBedStatusDto: UpdateBedStatusDto, tenantId: string) {
    try {
      this.logger.log(`Updating bed status for ID: ${id} to ${updateBedStatusDto.status} for tenant: ${tenantId}`);
      
      const bed = await this.prisma.bed.findFirst({ 
        where: { id, tenantId, isActive: true } 
      });
      
      if (!bed) {
        this.logger.warn(`Bed not found with ID: ${id} for tenant: ${tenantId}`);
        throw new NotFoundException('Bed not found');
      }

      const updated = await this.prisma.bed.update({
        where: { id },
        data: {
          status: updateBedStatusDto.status,
          ...(updateBedStatusDto.notes && { description: updateBedStatusDto.notes }),
        },
        include: this.getBedIncludes(),
      });

      this.logger.log(`Successfully updated bed ${bed.bedNumber} status to ${updateBedStatusDto.status}`);
      return { 
        success: true, 
        message: 'Bed status updated successfully', 
        data: updated 
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error updating bed status:', error.message, error.stack);
      if (error.code === 'P2025') {
        throw new NotFoundException('Bed not found');
      }
      throw new BadRequestException('Failed to update bed status');
    }
  }

  /**
   * Get IPD statistics
   */
  async getStats(tenantId: string) {
    try {
      this.logger.log(`Getting IPD stats for tenant: ${tenantId}`);
      
      const [totalWards, totalBeds, availableBeds, occupiedBeds, maintenanceBeds, reservedBeds] =
        await Promise.all([
          this.prisma.ward.count({ where: { tenantId, isActive: true } }),
          this.prisma.bed.count({ where: { tenantId, isActive: true } }),
          this.prisma.bed.count({
            where: { tenantId, isActive: true, status: BedStatus.AVAILABLE },
          }),
          this.prisma.bed.count({
            where: { tenantId, isActive: true, status: BedStatus.OCCUPIED },
          }),
          this.prisma.bed.count({
            where: { tenantId, isActive: true, status: BedStatus.MAINTENANCE },
          }),
          this.prisma.bed.count({
            where: { tenantId, isActive: true, status: BedStatus.RESERVED },
          }),
        ]);

      const occupancyRate = totalBeds > 0 ? ((occupiedBeds / totalBeds) * 100).toFixed(2) : 0;
      
      this.logger.log(`Successfully retrieved IPD stats for tenant: ${tenantId}`);
      return {
        success: true,
        data: {
          wards: {
            total: totalWards,
          },
          beds: {
            total: totalBeds,
            available: availableBeds,
            occupied: occupiedBeds,
            maintenance: maintenanceBeds,
            reserved: reservedBeds,
          },
          occupancyRate: Number(occupancyRate),
        },
      };
    } catch (error) {
      this.logger.error('Error getting IPD stats:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch IPD statistics');
    }
  }
}
