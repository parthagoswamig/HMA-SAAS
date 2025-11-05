import { Body, Controller, Post, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

class TenantOnboardingDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(3)
  slug: string;
}

@ApiTags('tenant-onboarding')
@Controller('tenant-onboarding')
export class TenantOnboardingController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Self-service tenant registration' })
  async register(@Body() dto: TenantOnboardingDto) {
    // Check if slug is already taken
    const existingTenant = await this.prisma.tenant.findUnique({
      where: { slug: dto.slug },
    });
    if (existingTenant) {
      throw new BadRequestException('Tenant slug already taken');
    }

    // Check if email is already registered
    const existingUser = await this.prisma.user.findFirst({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create tenant and admin user in transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Create tenant
      const tenant = await tx.tenant.create({
        data: {
          name: dto.name,
          slug: dto.slug,
          isActive: true,
        },
      });

      // Find or create default admin role
      let adminRole = await tx.tenantRole.findFirst({
        where: {
          tenantId: tenant.id,
          name: 'admin',
        },
      });

      if (!adminRole) {
        adminRole = await tx.tenantRole.create({
          data: {
            tenantId: tenant.id,
            name: 'admin',
            description: 'Administrator',
            isSystem: true,
          },
        });
      }

      // Create admin user
      const user = await tx.user.create({
        data: {
          email: dto.email,
          passwordHash,
          firstName: dto.name,
          lastName: 'Admin',
          role: 'ADMIN' as any,
          roleId: adminRole.id,
          tenantId: tenant.id,
          isActive: true,
        },
      });

      return { tenant, user };
    });

    return {
      success: true,
      message: 'Tenant created successfully',
      data: {
        tenantId: result.tenant.id,
        tenantSlug: result.tenant.slug,
        adminId: result.user.id,
        adminEmail: result.user.email,
      },
    };
  }
}
