import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Ip,
} from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { JwtAuthGuard, Public } from '../guards/jwt-auth.guard';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Login - Public endpoint
   * POST /auth/login
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto, @Ip() ipAddress: string) {
    return this.authService.login(loginDto, ipAddress);
  }

  /**
   * Register - Public endpoint
   * POST /auth/register
   */
  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.authService.register(registerDto);
    // Don't return sensitive data
    const { passwordHash, twoFASecret, ...safeUser } = user;
    return {
      message: 'User registered successfully. Please verify your email.',
      user: safeUser,
    };
  }

  /**
   * Refresh access token - Public endpoint
   * POST /auth/refresh
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  /**
   * Request password reset - Public endpoint
   * POST /auth/password/reset-request
   */
  @Public()
  @Post('password/reset-request')
  @HttpCode(HttpStatus.OK)
  async requestPasswordReset(@Body() dto: RequestPasswordResetDto) {
    await this.authService.requestPasswordReset(dto.email, dto.tenantId);
    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  /**
   * Reset password with token - Public endpoint
   * POST /auth/password/reset
   */
  @Public()
  @Post('password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return {
      message: 'Password reset successfully. You can now login.',
    };
  }

  /**
   * Verify email with token - Public endpoint
   * GET /auth/verify-email/:token
   */
  @Public()
  @Get('verify-email/:token')
  async verifyEmail(@Param('token') token: string) {
    await this.authService.verifyEmail(token);
    return {
      message: 'Email verified successfully. You can now login.',
    };
  }

  /**
   * Change password (authenticated users only)
   * PATCH /auth/password/change
   */
  @UseGuards(JwtAuthGuard)
  @Patch('password/change')
  async changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    await this.authService.changePassword(
      req.user.sub,
      dto.currentPassword,
      dto.newPassword,
    );
    return {
      message: 'Password changed successfully.',
    };
  }

  /**
   * Logout (authenticated users only)
   * POST /auth/logout
   */
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    await this.authService.logout(req.user.sub, req.user.sessionId);
    return {
      message: 'Logged out successfully.',
    };
  }

  /**
   * Get current user profile
   * GET /auth/me
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Request() req) {
    return {
      user: req.user,
    };
  }
}
