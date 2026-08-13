import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../prisma/prisma.service';
import { LoginDto } from '../../presentation/dtos/login.dto';
import * as argon2 from 'argon2';

const DUMMY_PASSWORD_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$FrjcflK4wy8m4hJAX5a2dg$F64ej0ErULl13zOD34tZZjKnhN/WhFVUrUV+WL4G4WY';

@Injectable()
export class LoginUseCase {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto) {
    const cpfClean = dto.cpf.replace(/\D/g, '');

    const employee = await this.prisma.employee.findUnique({
      where: { cpf: cpfClean },
      include: { user: true },
    });

    const passwordValid = await argon2.verify(
      employee?.user?.passwordHash ?? DUMMY_PASSWORD_HASH,
      dto.password,
    );

    if (!employee?.user || !employee.isActive || !passwordValid) {
      throw new UnauthorizedException('CPF ou senha incorretos');
    }

    const token = this.jwtService.sign({
      sub: employee.user.id,
      role: employee.user.role,
    });

    return {
      accessToken: token,
      user: {
        id: employee.user.id,
        fullName: employee.fullName,
        role: employee.user.role,
        employeeId: employee.id,
      },
    };
  }
}
