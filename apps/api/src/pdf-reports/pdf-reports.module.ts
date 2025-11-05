import { Module } from '@nestjs/common';
import { PdfReportsService } from './pdf-reports.service';
import { PdfReportsController } from './pdf-reports.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [PdfReportsService],
  controllers: [PdfReportsController],
  exports: [PdfReportsService],
})
export class PdfReportsModule {}
