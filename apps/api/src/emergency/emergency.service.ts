import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { Prisma } from '@prisma/client';
import {
  CreateEmergencyCaseDto,
  UpdateEmergencyCaseDto,
  UpdateTriageDto,
  EmergencyFilterDto,
  EmergencyStatus,
  TriageLevel,
} from './dto';

@Injectable()
export class EmergencyService {
  private readonly logger = new Logger(EmergencyService.name);

  constructor(private prisma: CustomPrismaService) {}

  private getEmergencyCaseIncludes() {
    return {
      patient: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          medicalRecordNumber: true,
          dateOfBirth: true,
          gender: true,
          phone: true,
        },
      },
      assignedDoctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          specialization: true,
        },
      },
    };
  }

  private buildEmergencyWhereClause(tenantId: string, filters: EmergencyFilterDto) {
    const { status, triageLevel, search } = filters;
    const where: any = { tenantId, isActive: true };
    
    if (status) where.status = status;
    if (triageLevel) where.triageLevel = triageLevel;
    if (search) {
      where.OR = [
        { chiefComplaint: { contains: search, mode: 'insensitive' } },
        { treatmentNotes: { contains: search, mode: 'insensitive' } },
        { patient: {
            OR: [
              { firstName: { contains: search, mode: 'insensitive' } },
              { lastName: { contains: search, mode: 'insensitive' } },
              { medicalRecordNumber: { contains: search, mode: 'insensitive' } },
            ],
          },
        },
      ];
    }
    return where;
  }

  async create(createDto: CreateEmergencyCaseDto, tenantId: string) {
    try {
      this.logger.log(`Creating emergency case for patient: ${createDto.patientId}, tenant: ${tenantId}`);
      
      const patient = await this.prisma.patient.findFirst({
        where: { id: createDto.patientId, tenantId },
      });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }

      const emergencyCase = await this.prisma.emergencyCase.create({
        data: {
          patientId: createDto.patientId,
          chiefComplaint: createDto.chiefComplaint,
          triageLevel: createDto.triageLevel as any,
          vitalSigns: createDto.vitalSigns ? JSON.stringify(createDto.vitalSigns) : null,
          status: 'WAITING' as any,
          arrivalTime: new Date(),
          tenantId,
        },
        include: this.getEmergencyCaseIncludes(),
      });

      this.logger.log(`Successfully created emergency case with ID: ${emergencyCase.id}`);
      return {
        success: true,
        message: 'Emergency case created successfully',
        data: emergencyCase,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error creating emergency case:', error.message, error.stack);
      throw new BadRequestException('Failed to create emergency case');
    }
  }

  async findAll(tenantId: string, filters: EmergencyFilterDto = {}) {
    try {
      this.logger.log(`Finding emergency cases for tenant: ${tenantId}`);
      const { page = 1, limit = 10 } = filters;
      const skip = (page - 1) * limit;
      const where = this.buildEmergencyWhereClause(tenantId, filters);

      const [cases, total] = await Promise.all([
        this.prisma.emergencyCase.findMany({
          where,
          skip,
          take: limit,
          include: this.getEmergencyCaseIncludes(),
          orderBy: [{ triageLevel: 'asc' }, { arrivalTime: 'desc' }],
        }),
        this.prisma.emergencyCase.count({ where }),
      ]);

      this.logger.log(`Found ${cases.length} emergency cases out of ${total} total`);
      return {
        success: true,
        data: {
          items: cases,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      this.logger.error('Error finding emergency cases:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch emergency cases');
    }
  }

  async findOne(id: string, tenantId: string) {
    try {
      this.logger.log(`Finding emergency case with ID: ${id} for tenant: ${tenantId}`);
      
      const emergencyCase = await this.prisma.emergencyCase.findFirst({
        where: { id, tenantId, isActive: true },
        include: this.getEmergencyCaseIncludes(),
      });
      
      if (!emergencyCase) {
        this.logger.warn(`Emergency case not found with ID: ${id}`);
        throw new NotFoundException('Emergency case not found');
      }
      
      return { success: true, data: emergencyCase };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error finding emergency case:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch emergency case');
    }
  }

  async update(id: string, updateDto: UpdateEmergencyCaseDto, tenantId: string) {
    try {
      this.logger.log(`Updating emergency case with ID: ${id}`);
      
      const emergencyCase = await this.prisma.emergencyCase.findFirst({
        where: { id, tenantId },
      });
      if (!emergencyCase) {
        throw new NotFoundException('Emergency case not found');
      }
      
      const updated = await this.prisma.emergencyCase.update({
        where: { id },
        data: updateDto,
        include: this.getEmergencyCaseIncludes(),
      });
      
      this.logger.log(`Successfully updated emergency case: ${updated.id}`);
      return { 
        success: true, 
        message: 'Emergency case updated successfully', 
        data: updated 
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating emergency case:', error.message, error.stack);
      throw new BadRequestException('Failed to update emergency case');
    }
  }

  async updateTriage(id: string, triageDto: UpdateTriageDto, tenantId: string) {
    try {
      this.logger.log(`Updating triage for emergency case: ${id} to ${triageDto.triageLevel}`);
      
      const emergencyCase = await this.prisma.emergencyCase.findFirst({
        where: { id, tenantId },
      });
      if (!emergencyCase) {
        throw new NotFoundException('Emergency case not found');
      }
      
      const updated = await this.prisma.emergencyCase.update({
        where: { id },
        data: {
          triageLevel: triageDto.triageLevel as any,
        },
        include: this.getEmergencyCaseIncludes(),
      });
      
      this.logger.log(`Successfully updated triage level to: ${triageDto.triageLevel}`);
      return { 
        success: true, 
        message: 'Triage level updated successfully', 
        data: updated 
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating triage:', error.message, error.stack);
      throw new BadRequestException('Failed to update triage level');
    }
  }

  async getQueue(tenantId: string) {
    try {
      this.logger.log(`Getting emergency queue for tenant: ${tenantId}`);
      
      const queue = await this.prisma.emergencyCase.findMany({
        where: { 
          tenantId, 
          status: { in: [EmergencyStatus.WAITING, EmergencyStatus.IN_TREATMENT] } 
        },
        include: this.getEmergencyCaseIncludes(),
        orderBy: [{ triageLevel: 'asc' }, { arrivalTime: 'asc' }],
      });
      
      this.logger.log(`Found ${queue.length} cases in emergency queue`);
      return { success: true, data: queue };
    } catch (error) {
      this.logger.error('Error getting emergency queue:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch emergency queue');
    }
  }

  async getStats(tenantId: string) {
    try {
      this.logger.log(`Getting emergency stats for tenant: ${tenantId}`);
      
      const [total, waiting, inTreatment, discharged, admitted, criticalCases] = await Promise.all([
        this.prisma.emergencyCase.count({ where: { tenantId, isActive: true } }),
        this.prisma.emergencyCase.count({ where: { tenantId, status: EmergencyStatus.WAITING } }),
        this.prisma.emergencyCase.count({ where: { tenantId, status: EmergencyStatus.IN_TREATMENT } }),
        this.prisma.emergencyCase.count({ where: { tenantId, status: EmergencyStatus.DISCHARGED } }),
        this.prisma.emergencyCase.count({ where: { tenantId, status: EmergencyStatus.ADMITTED } }),
        this.prisma.emergencyCase.count({ where: { tenantId, triageLevel: TriageLevel.CRITICAL } }),
      ]);
      
      this.logger.log(`Successfully retrieved emergency stats for tenant: ${tenantId}`);
      return {
        success: true,
        data: { 
          total, 
          waiting, 
          inTreatment, 
          discharged, 
          admitted, 
          criticalCases 
        },
      };
    } catch (error) {
      this.logger.error('Error getting emergency stats:', error.message, error.stack);
      throw new BadRequestException('Failed to fetch emergency statistics');
    }
  }
}
