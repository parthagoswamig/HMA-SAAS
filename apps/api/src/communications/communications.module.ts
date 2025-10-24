import { Module } from '@nestjs/common';
import { CommunicationsController } from './communications.controller';
import { CommunicationsService } from './communications.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [CommunicationsController],
  providers: [CommunicationsService, PrismaService],
  exports: [CommunicationsService],
})
export class CommunicationsModule {}
