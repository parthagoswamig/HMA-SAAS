import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { SupabaseAuthService } from './services/supabase-auth.service';
import { CustomPrismaService } from '../prisma/custom-prisma.service';

@Injectable()
export class JwtSupabaseStrategy extends PassportStrategy(Strategy, 'jwt-supabase') {
  private readonly logger = new Logger(JwtSupabaseStrategy.name);

  constructor(
    private configService: ConfigService,
    private authService: AuthService,
    private supabaseAuth: SupabaseAuthService,
    private prisma: CustomPrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('SUPABASE_JWT_SECRET') || 
                   configService.get<string>('JWT_SECRET', 'your-secret-key'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: any) {
    try {
      // Check if it's a Supabase token
      if (payload.aud && payload.aud === 'authenticated' && payload.sub) {
        // Supabase token - verify with Supabase
        const supabaseUser = await this.supabaseAuth.getUser();
        
        if (!supabaseUser) {
          this.logger.warn('Invalid Supabase token');
          throw new UnauthorizedException('Invalid token');
        }

        // Find or create user in our database
        let user = await this.prisma.user.findUnique({
          where: { email: supabaseUser.email },
          include: {
            tenant: true,
            tenantRole: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        });

        if (!user) {
          // Auto-create user from Supabase if not exists
          const defaultTenant = await this.prisma.tenant.findFirst({
            where: { isActive: true },
          });

          if (!defaultTenant) {
            throw new UnauthorizedException('No active tenant found');
          }

          user = await this.prisma.user.create({
            data: {
              email: supabaseUser.email!,
              passwordHash: 'SUPABASE_AUTH', // Placeholder for Supabase auth
              firstName: supabaseUser.user_metadata?.firstName || 'User',
              lastName: supabaseUser.user_metadata?.lastName || 'Name',
              role: supabaseUser.user_metadata?.role || 'PATIENT',
              tenantId: defaultTenant.id,
              isActive: true,
            },
            include: {
              tenant: true,
              tenantRole: {
                include: {
                  rolePermissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          });
        }

        // Extract permissions
        const permissions = user.tenantRole
          ? user.tenantRole.rolePermissions.map((rp) => rp.permission.name)
          : [];

        return {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          roleId: user.roleId,
          tenantId: user.tenantId,
          permissions,
          isSupabaseAuth: true,
        };
      } else {
        // Local JWT token
        const user = await this.authService.validateUser(payload.sub);
        if (!user) {
          throw new UnauthorizedException('Invalid user');
        }

        return {
          userId: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          roleId: payload.roleId,
          tenantId: user.tenantId,
          permissions: payload.permissions || [],
          isSupabaseAuth: false,
        };
      }
    } catch (error) {
      this.logger.error('Token validation failed:', error);
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
