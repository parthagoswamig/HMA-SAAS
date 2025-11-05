import { Controller, Get, Param, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { PdfReportsService } from './pdf-reports.service';
import { PrismaService } from '../prisma/prisma.service';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../core/rbac/decorators/roles.decorator';
import { UserRole } from '../core/rbac/enums/roles.enum';
import { TenantId } from '../auth/user-tenant.decorators';
import { Response } from 'express';
import { createReadStream, unlinkSync } from 'fs';

@ApiTags('pdf-reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pdf-reports')
export class PdfReportsController {
  constructor(
    private pdfService: PdfReportsService,
    private prisma: PrismaService,
  ) {}

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST)
  @Get('invoice/:id')
  @ApiOperation({ summary: 'Generate invoice PDF' })
  async getInvoicePdf(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Res() res: Response,
  ) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
        items: true,
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const filepath = await this.pdfService.generateInvoicePdf(invoice);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoiceNumber || id}.pdf"`);

    const stream = createReadStream(filepath);
    stream.pipe(res);
    stream.on('end', () => {
      // Clean up temp file
      try {
        unlinkSync(filepath);
      } catch (error) {
        console.error('Failed to delete temp PDF:', error);
      }
    });
  }

  @Roles(UserRole.HOSPITAL_ADMIN, UserRole.SUPER_ADMIN, UserRole.RECEPTIONIST)
  @Get('prescription/:id')
  @ApiOperation({ summary: 'Generate prescription PDF' })
  async getPrescriptionPdf(
    @Param('id') id: string,
    @TenantId() tenantId: string,
    @Res() res: Response,
  ) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id, tenantId },
      include: {
        patient: true,
      },
    });

    if (!prescription) {
      throw new NotFoundException('Prescription not found');
    }

    const filepath = await this.pdfService.generatePrescriptionPdf(prescription);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="prescription-${id}.pdf"`);

    const stream = createReadStream(filepath);
    stream.pipe(res);
    stream.on('end', () => {
      try {
        unlinkSync(filepath);
      } catch (error) {
        console.error('Failed to delete temp PDF:', error);
      }
    });
  }
}
