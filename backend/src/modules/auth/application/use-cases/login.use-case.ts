import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../../prisma/prisma.service';
import { LoginDto } from '../../presentation/dtos/login.dto';
import * as argon2 from 'argon2';

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

    if (!employee?.user) {
      throw new UnauthorizedException('CPF ou senha incorretos');
    }

    if (!employee.isActive) {
      throw new UnauthorizedException('Funcionário inativo');
    }

    const passwordValid = await argon2.verify(
      employee.user.passwordHash,
      dto.password,
    );

    if (!passwordValid) {
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
