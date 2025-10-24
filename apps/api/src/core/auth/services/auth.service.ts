import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { PasswordService } from './password.service';
import { TokenService, JwtPayload, TokenPair } from './token.service';
import { getPermissionsForRole } from '../../rbac/role-permission.mapping';
import { UserRole } from '../../rbac/enums/roles.enum';
import * as crypto from 'crypto';

export interface LoginDto {
  email: string;
  password: string;
  tenantId?: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  phone?: string;
  tenantId: string;
  role?: UserRole;
}

export interface LoginResponse {
  user: Partial<User>;
  tokens: TokenPair;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  /**
   * User login
   */
  async login(loginDto: LoginDto, ipAddress?: string): Promise<LoginResponse> {
    const { email, password, tenantId } = loginDto;

    // Find user by email and tenantId
    const user = await this.userRepository.findOne({
      where: { email, ...(tenantId && { tenantId }) },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      throw new UnauthorizedException(
        `Account is locked until ${user.lockedUntil?.toISOString()}`,
      );
    }

    // Check if account is active
    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive');
    }

    // Verify password
    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;

      // Lock account after 5 failed attempts
      if (user.failedLoginAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
      }

      await this.userRepository.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed login attempts on successful login
    user.failedLoginAttempts = 0;
    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;
    await this.userRepository.save(user);

    // Generate tokens
    const sessionId = crypto.randomUUID();
    const permissions = getPermissionsForRole(user.role);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.customPermissions || permissions,
      sessionId,
    };

    const tokens = await this.tokenService.generateTokens(payload);

    // Return user without sensitive data
    const { passwordHash, twoFASecret, ...userWithoutSensitiveData } = user;

    return {
      user: userWithoutSensitiveData,
      tokens,
    };
  }

  /**
   * User registration
   */
  async register(registerDto: RegisterDto): Promise<User> {
    const { email, password, tenantId } = registerDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email, tenantId },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate password strength
    const passwordValidation = this.passwordService.validatePasswordStrength(password);
    if (!passwordValidation.valid) {
      throw new BadRequestException(passwordValidation.errors.join(', '));
    }

    // Hash password
    const passwordHash = await this.passwordService.hashPassword(password);

    // Generate email verification token
    const { token: emailVerificationToken, expires: emailVerificationExpires } =
      this.passwordService.generateEmailVerificationToken();

    // Create user
    const user = this.userRepository.create({
      ...registerDto,
      passwordHash,
      emailVerificationToken,
      emailVerificationExpires,
      role: registerDto.role || UserRole.PATIENT,
    });

    await this.userRepository.save(user);

    // TODO: Send verification email

    return user;
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const decoded = await this.tokenService.verifyRefreshToken(refreshToken);

    const user = await this.userRepository.findOne({
      where: { id: decoded.sub },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const permissions = getPermissionsForRole(user.role);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      permissions: user.customPermissions || permissions,
      sessionId: decoded.sessionId,
    };

    return this.tokenService.generateTokens(payload);
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string, tenantId: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { email, tenantId },
    });

    if (!user) {
      // Don't reveal if user exists for security
      return;
    }

    const { token, expires } = this.passwordService.generatePasswordResetToken();

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;

    await this.userRepository.save(user);

    // TODO: Send password reset email
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid or expired reset token');
    }

    if (
      !user.resetPasswordExpires ||
      this.passwordService.isTokenExpired(user.resetPasswordExpires)
    ) {
      throw new BadRequestException('Reset token has expired');
    }

    // Validate password strength
    const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new BadRequestException(passwordValidation.errors.join(', '));
    }

    // Hash new password
    user.passwordHash = await this.passwordService.hashPassword(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    user.failedLoginAttempts = 0;
    user.lockedUntil = null;

    await this.userRepository.save(user);
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new NotFoundException('Invalid verification token');
    }

    if (
      !user.emailVerificationExpires ||
      this.passwordService.isTokenExpired(user.emailVerificationExpires)
    ) {
      throw new BadRequestException('Verification token has expired');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await this.userRepository.save(user);
  }

  /**
   * Change password (for authenticated users)
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const isPasswordValid = await this.passwordService.comparePassword(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Validate new password strength
    const passwordValidation = this.passwordService.validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new BadRequestException(passwordValidation.errors.join(', '));
    }

    // Hash new password
    user.passwordHash = await this.passwordService.hashPassword(newPassword);

    await this.userRepository.save(user);
  }

  /**
   * Logout (invalidate tokens - requires Redis for token blacklisting)
   */
  async logout(userId: string, sessionId?: string): Promise<void> {
    // TODO: Implement token blacklisting with Redis
    // For now, client-side token removal is sufficient
  }
}
