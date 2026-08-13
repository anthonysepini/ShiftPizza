import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../../../../common/types/authenticated-user';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'],
    });
  }

  async validate(payload: {
    sub?: unknown;
    role?: unknown;
  }): Promise<AuthenticatedUser> {
    if (typeof payload.sub !== 'string' || payload.sub.trim() === '') {
      throw new UnauthorizedException('Token inválido');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { employee: true },
    });

    if (!user || !user.employee.isActive) {
      throw new UnauthorizedException('Token inválido');
    }

    return {
      id: user.id,
      role: user.role,
      employeeId: user.employeeId,
      fullName: user.employee.fullName,
    };
  }
}
