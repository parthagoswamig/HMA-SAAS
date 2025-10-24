import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CustomPrismaService } from '../prisma/custom-prisma.service';
import * as bcrypt from 'bcryptjs';

export interface RegisterUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  tenantId: string;
  role?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface ForgotPasswordDto {
  email: string;
}

export interface ResetPasswordDto {
  token: string;
  newPassword: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: CustomPrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterUserDto) {
    const { email, password, firstName, lastName, phone, tenantId, role } = registerDto;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !tenantId) {
      throw new BadRequestException('Missing required fields: email, password, firstName, lastName, tenantId');
    }

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    try {
      // Create admin user
      const user = await this.prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName,
          lastName,
          role: (role || 'ADMIN') as any,
          tenantId,
          isActive: true,
        },
      });

      return {
        success: true,
        message: 'User registered successfully',
        data: {
          userId: user.id,
          email: user.email,
          tenantId: user.tenantId,
        },
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw new BadRequestException('Registration failed. Please try again.');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email with role and permissions
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
        tenantRole: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
              where: {
                permission: {
                  isActive: true,
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is not active');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Extract permissions
    const permissions = user.tenantRole
      ? user.tenantRole.rolePermissions.map((rp) => rp.permission.name)
      : [];

    // Generate JWT token
    const payload = {
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      role: user.role,
      roleId: user.roleId,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload);

    // Update last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        roleId: user.roleId,
        tenantId: user.tenantId,
        permissions,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          type: user.tenant.type,
        },
      },
    };
  }

  async validateUser(userId: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
      },
    });

    if (!user || !user.isActive) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      tenantId: user.tenantId,
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    // Find user by email
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    // Don't reveal if user exists or not for security
    if (!user) {
      return {
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'password-reset' },
      { expiresIn: '1h' }
    );

    // In production, send email with reset link
    // For now, we'll return the token (in production, never return this!)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // TODO: Send email with resetLink
    console.log('Password reset link:', resetLink);

    return {
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
      // Remove this in production!
      resetToken, // Only for development
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordDto;

    try {
      // Verify token
      const payload = this.jwtService.verify(token);

      // Check if it's a password reset token
      if (payload.type !== 'password-reset') {
        throw new BadRequestException('Invalid reset token');
      }

      // Find user
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hashedPassword,
        },
      });

      return {
        success: true,
        message: 'Password has been reset successfully. You can now login with your new password.',
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Reset token has expired. Please request a new one.');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid reset token.');
      }
      throw error;
    }
  }
}
