import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt.guard';
import { UserId, TenantId } from './user-tenant.decorators';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  async register(@Body() body: {
    email: string; password: string; firstName: string; lastName?: string;
    tenantId: string; role?: string;
  }) {
    return this.auth.register({
      email: body.email,
      password: body.password,
      firstName: body.firstName,
      lastName: body.lastName,
      tenantId: body.tenantId,
      role: body.role as any,
    });
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string; tenantId: string }) {
    return this.auth.login(body.email, body.password, body.tenantId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@UserId() userId: string) {
    return this.auth.me(userId);
  }
}
