import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { LoginUseCase } from '../../application/use-cases/login.use-case';
import { LoginDto } from '../dtos/login.dto';

@ApiTags('auth')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login com CPF e senha — retorna token JWT' })
  @ApiOkResponse({ description: 'Token gerado com sucesso' })
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}
