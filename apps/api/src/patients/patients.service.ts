import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import { CreatePatientDto, UpdatePatientDto, PatientQueryDto } from './dto';

@Injectable()
export class PatientsService {
  private readonly logger = new Logger(PatientsService.name);

  constructor(private readonly prisma: CustomPrismaService) {}

  async create(createPatientDto: CreatePatientDto, tenantId: string) {
    try {
      const mrn = await this.generateMedicalRecordNumber(tenantId);

      const data = {
        ...createPatientDto,
        medicalRecordNumber: mrn,
        tenantId,
        country: createPatientDto.country || 'India',
        dateOfBirth: createPatientDto.dateOfBirth
          ? new Date(createPatientDto.dateOfBirth)
          : undefined,
      };

      const patientRaw = await this.prisma.patient.create({ 
        data,
        include: {
          _count: {
            select: {
              appointments: true,
            },
          },
        },
      });

      this.logger.log(`Patient created: ${patientRaw.id} for tenant: ${tenantId}`);

      // Transform to match frontend expected structure
      const age = patientRaw.dateOfBirth
        ? Math.floor(
            (new Date().getTime() - new Date(patientRaw.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
          )
        : 0;

      const patient = {
        id: patientRaw.id,
        patientId: patientRaw.medicalRecordNumber,
        firstName: patientRaw.firstName,
        middleName: patientRaw.middleName,
        lastName: patientRaw.lastName,
        dateOfBirth: patientRaw.dateOfBirth,
        age,
        gender: patientRaw.gender,
        bloodGroup: patientRaw.bloodType,
        maritalStatus: patientRaw.maritalStatus,
        contactInfo: {
          phone: patientRaw.phone || '',
          email: patientRaw.email || '',
          alternatePhone: '',
          emergencyContact: {
            name: '',
            phone: '',
            relationship: '',
          },
        },
        address: {
          street: patientRaw.address || '',
          city: patientRaw.city || '',
          state: patientRaw.state || '',
          country: patientRaw.country || 'India',
          postalCode: patientRaw.pincode || '',
          landmark: '',
        },
        allergies: patientRaw.allergies
          ? Array.isArray(patientRaw.allergies)
            ? patientRaw.allergies
            : []
          : [],
        chronicDiseases: patientRaw.chronicConditions
          ? Array.isArray(patientRaw.chronicConditions)
            ? patientRaw.chronicConditions
            : []
          : [],
        currentMedications: patientRaw.currentMedications
          ? Array.isArray(patientRaw.currentMedications)
            ? patientRaw.currentMedications
            : []
          : [],
        insuranceInfo: patientRaw.insuranceProvider
          ? {
              insuranceType: patientRaw.insuranceType || 'self_pay',
              insuranceProvider: patientRaw.insuranceProvider,
              policyNumber: patientRaw.insuranceId || '',
              policyHolderName: '',
              relationshipToPatient: '',
              coverageAmount: 0,
              isActive: !!patientRaw.insuranceProvider,
            }
          : undefined,
        status: patientRaw.isActive ? 'active' : 'inactive',
        registrationDate: patientRaw.createdAt,
        lastVisitDate: undefined,
        totalVisits: patientRaw._count?.appointments || 0,
      };

      return {
        success: true,
        message: 'Patient created successfully',
        data: patient,
      };
    } catch (error) {
      this.logger.error(`Error creating patient: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to create patient');
    }
  }

  async findAll(tenantId: string, query: PatientQueryDto) {
    const { page = 1, limit = 10, search, status = 'active' } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      isActive: status === 'active',
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { medicalRecordNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [patientsRaw, total] = await Promise.all([
      this.prisma.patient.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          medicalRecordNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          dateOfBirth: true,
          gender: true,
          bloodType: true,
          maritalStatus: true,
          phone: true,
          email: true,
          address: true,
          city: true,
          state: true,
          country: true,
          pincode: true,
          allergies: true,
          chronicConditions: true,
          currentMedications: true,
          insuranceProvider: true,
          insuranceId: true,
          insuranceType: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          appointments: {
            select: {
              id: true,
              startTime: true,
            },
            orderBy: {
              startTime: 'desc',
            },
            take: 1,
          },
          _count: {
            select: {
              appointments: true,
            },
          },
        },
      }),
      this.prisma.patient.count({ where }),
    ]);

    // Transform patients to match frontend expected structure
    const patients = patientsRaw.map((patient) => {
      const age = patient.dateOfBirth
        ? Math.floor(
            (new Date().getTime() - new Date(patient.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
          )
        : 0;

      return {
        id: patient.id,
        patientId: patient.medicalRecordNumber,
        firstName: patient.firstName,
        middleName: patient.middleName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        age,
        gender: patient.gender,
        bloodGroup: patient.bloodType,
        maritalStatus: patient.maritalStatus,
        contactInfo: {
          phone: patient.phone || '',
          email: patient.email || '',
          alternatePhone: '',
          emergencyContact: {
            name: '',
            phone: '',
            relationship: '',
          },
        },
        address: {
          street: patient.address || '',
          city: patient.city || '',
          state: patient.state || '',
          country: patient.country || 'India',
          postalCode: patient.pincode || '',
          landmark: '',
        },
        allergies: patient.allergies
          ? Array.isArray(patient.allergies)
            ? patient.allergies
            : []
          : [],
        chronicDiseases: patient.chronicConditions
          ? Array.isArray(patient.chronicConditions)
            ? patient.chronicConditions
            : []
          : [],
        currentMedications: patient.currentMedications
          ? Array.isArray(patient.currentMedications)
            ? patient.currentMedications
            : []
          : [],
        insuranceInfo: patient.insuranceProvider
          ? {
              insuranceType: patient.insuranceType || 'self_pay',
              insuranceProvider: patient.insuranceProvider,
              policyNumber: patient.insuranceId || '',
              policyHolderName: '',
              relationshipToPatient: '',
              coverageAmount: 0,
              isActive: !!patient.insuranceProvider,
            }
          : undefined,
        status: patient.isActive ? 'active' : 'inactive',
        registrationDate: patient.createdAt,
        lastVisitDate:
          patient.appointments && patient.appointments.length > 0
            ? patient.appointments[0].startTime
            : undefined,
        totalVisits: patient._count?.appointments || 0,
      };
    });

    return {
      success: true,
      data: {
        patients,
        pagination: {
          total,
          page: page,
          limit: limit,
          pages: Math.ceil(total / limit),
        },
      },
    };
  }

  async search(tenantId: string, query: string) {
    if (!query || query.length < 2) {
      return { success: true, data: [] };
    }

    const patients = await this.prisma.patient.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { firstName: { contains: query } },
          { lastName: { contains: query } },
          { email: { contains: query } },
          // { phoneNumber: { contains: query } },
          { medicalRecordNumber: { contains: query } },
        ],
      },
      take: 10,
      select: {
        id: true,
        medicalRecordNumber: true,
        firstName: true,
        lastName: true,
        phone: true,
        dateOfBirth: true,
        gender: true,
      },
    });

    return {
      success: true,
      data: patients,
    };
  }

  async findOne(id: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { id, tenantId },
      include: {
        appointments: {
          take: 5,
          orderBy: { startTime: 'desc' },
          include: {
            doctor: {
              select: { firstName: true, lastName: true },
            },
          },
        },
        medicalRecords: {
          take: 5,
          orderBy: { date: 'desc' },
        },
        prescriptions: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            doctor: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      success: true,
      data: patient,
    };
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    tenantId: string,
  ) {
    try {
      const data = {
        ...updatePatientDto,
        dateOfBirth: updatePatientDto.dateOfBirth
          ? new Date(updatePatientDto.dateOfBirth)
          : undefined,
      };

      const patientRaw = await this.prisma.patient.update({
        where: { id, tenantId },
        data,
        include: {
          _count: {
            select: {
              appointments: true,
            },
          },
          appointments: {
            select: {
              id: true,
              startTime: true,
            },
            orderBy: {
              startTime: 'desc',
            },
            take: 1,
          },
        },
      });

      this.logger.log(`Patient updated: ${id} for tenant: ${tenantId}`);

      // Transform to match frontend expected structure
      const age = patientRaw.dateOfBirth
        ? Math.floor(
            (new Date().getTime() - new Date(patientRaw.dateOfBirth).getTime()) /
              (365.25 * 24 * 60 * 60 * 1000),
          )
        : 0;

      const patient = {
        id: patientRaw.id,
        patientId: patientRaw.medicalRecordNumber,
        firstName: patientRaw.firstName,
        middleName: patientRaw.middleName,
        lastName: patientRaw.lastName,
        dateOfBirth: patientRaw.dateOfBirth,
        age,
        gender: patientRaw.gender,
        bloodGroup: patientRaw.bloodType,
        maritalStatus: patientRaw.maritalStatus,
        contactInfo: {
          phone: patientRaw.phone || '',
          email: patientRaw.email || '',
          alternatePhone: '',
          emergencyContact: {
            name: '',
            phone: '',
            relationship: '',
          },
        },
        address: {
          street: patientRaw.address || '',
          city: patientRaw.city || '',
          state: patientRaw.state || '',
          country: patientRaw.country || 'India',
          postalCode: patientRaw.pincode || '',
          landmark: '',
        },
        allergies: patientRaw.allergies
          ? Array.isArray(patientRaw.allergies)
            ? patientRaw.allergies
            : []
          : [],
        chronicDiseases: patientRaw.chronicConditions
          ? Array.isArray(patientRaw.chronicConditions)
            ? patientRaw.chronicConditions
            : []
          : [],
        currentMedications: patientRaw.currentMedications
          ? Array.isArray(patientRaw.currentMedications)
            ? patientRaw.currentMedications
            : []
          : [],
        insuranceInfo: patientRaw.insuranceProvider
          ? {
              insuranceType: patientRaw.insuranceType || 'self_pay',
              insuranceProvider: patientRaw.insuranceProvider,
              policyNumber: patientRaw.insuranceId || '',
              policyHolderName: '',
              relationshipToPatient: '',
              coverageAmount: 0,
              isActive: !!patientRaw.insuranceProvider,
            }
          : undefined,
        status: patientRaw.isActive ? 'active' : 'inactive',
        registrationDate: patientRaw.createdAt,
        lastVisitDate:
          patientRaw.appointments && patientRaw.appointments.length > 0
            ? patientRaw.appointments[0].startTime
            : undefined,
        totalVisits: patientRaw._count?.appointments || 0,
      };

      return {
        success: true,
        message: 'Patient updated successfully',
        data: patient,
      };
    } catch (error) {
      this.logger.error(`Error updating patient: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to update patient');
    }
  }

  async remove(id: string, tenantId: string) {
    try {
      await this.prisma.patient.update({
        where: { id, tenantId },
        data: {
          isActive: false,
          deletedAt: new Date(),
        },
      });

      this.logger.log(`Patient soft deleted: ${id} for tenant: ${tenantId}`);

      return {
        success: true,
        message: 'Patient deleted successfully',
      };
    } catch (error) {
      this.logger.error(`Error deleting patient: ${error.message}`, error.stack);
      throw new BadRequestException('Failed to delete patient');
    }
  }

  async getStats(tenantId: string) {
    const [totalPatients, activePatients, todaysPatients, weekPatients] =
      await Promise.all([
        this.prisma.patient.count({ where: { tenantId } }),
        this.prisma.patient.count({ where: { tenantId, isActive: true } }),
        this.prisma.patient.count({
          where: {
            tenantId,
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        this.prisma.patient.count({
          where: {
            tenantId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ]);

    return {
      success: true,
      data: {
        totalPatients,
        activePatients,
        todaysPatients,
        weekPatients,
      },
    };
  }

  private async generateMedicalRecordNumber(tenantId: string): Promise<string> {
    const prefix = 'MRN';
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');

    // Get the count of patients for this tenant to generate sequential number
    const patientCount = await this.prisma.patient.count({
      where: { tenantId },
    });
    const sequence = (patientCount + 1).toString().padStart(6, '0');

    return `${prefix}${year}${month}${sequence}`;
  }
}
