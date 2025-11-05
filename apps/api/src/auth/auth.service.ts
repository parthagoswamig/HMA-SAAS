import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  async register(dto: {
    email: string; password: string; firstName: string; lastName?: string;
    tenantId: string; role?: Role;
  }) {
    const exists = await this.prisma.user.findFirst({
      where: { email: dto.email, tenantId: dto.tenantId },
    });
    if (exists) throw new ConflictException('Email already used for this tenant');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: dto.role ?? Role.RECEPTIONIST,
        tenantId: dto.tenantId,
      },
    });
    const token = await this.sign(user.id, user.tenantId, user.role);
    return { token, user: this.safeUser(user) };
  }

  async login(email: string, password: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({ where: { email, tenantId } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = await this.sign(user.id, user.tenantId, user.role);
    return { token, user: this.safeUser(user) };
  }

  async me(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();
    return this.safeUser(user);
  }

  private async sign(sub: string, tenantId: string, role: Role) {
    return this.jwt.signAsync({ sub, tenantId, role });
  }

  private safeUser(u: any) {
    const { passwordHash, ...rest } = u;
    return rest;
  }
}
