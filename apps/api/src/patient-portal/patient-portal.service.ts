import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatientPortalService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { createdBy: userId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient profile not found');
    return { success: true, data: patient };
  }

  async updateProfile(userId: string, updateDto: any, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { createdBy: userId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient profile not found');

    const updated = await this.prisma.patient.update({
      where: { id: patient.id },
      data: updateDto,
    });
    return { success: true, message: 'Profile updated', data: updated };
  }

  async getMyAppointments(userId: string, tenantId: string, query: any) {
    const patient = await this.prisma.patient.findFirst({
      where: { createdBy: userId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const appointments = await this.prisma.appointment.findMany({
      where: { patientId: patient.id, tenantId },
      include: { doctor: true, department: true },
      orderBy: { startTime: 'desc' },
    });

    return { success: true, data: appointments };
  }

  async bookAppointment(userId: string, createDto: any, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { createdBy: userId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const appointment = await this.prisma.appointment.create({
      data: {
        ...createDto,
        patientId: patient.id,
        tenantId,
      },
      include: { doctor: true },
    });

    return { success: true, message: 'Appointment booked', data: appointment };
  }

  async getMyRecords(userId: string, tenantId: string, query: any) {
    const patient = await this.prisma.patient.findFirst({
      where: { createdBy: userId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const records = await this.prisma.medicalRecord.findMany({
      where: { patientId: patient.id, tenantId },
      include: { doctor: true },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: records };
  }

  async getMyLabResults(userId: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { createdBy: userId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const labOrders = await this.prisma.labOrder.findMany({
      where: { patientId: patient.id, tenantId },
      include: { tests: { include: { test: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: labOrders };
  }

  async getMyPrescriptions(userId: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { createdBy: userId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const prescriptions = await this.prisma.prescription.findMany({
      where: { patientId: patient.id, tenantId },
      include: {
        doctor: true,
        prescriptionItems: { include: { medication: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: prescriptions };
  }

  async getMyInvoices(userId: string, tenantId: string) {
    const patient = await this.prisma.patient.findFirst({
      where: { createdBy: userId, tenantId },
    });
    if (!patient) throw new NotFoundException('Patient not found');

    const invoices = await this.prisma.invoice.findMany({
      where: { patientId: patient.id, tenantId },
      include: { payments: true },
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: invoices };
  }
}
