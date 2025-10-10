/**
 * Presentation Layer - Authentication Controller
 * Handles HTTP requests for authentication
 */

import { Controller, Post, Body, UsePipes, HttpCode } from '@nestjs/common';
import { RegisterUseCase } from '@application/use-cases/auth/register.use-case';
import { LoginUseCase } from '@application/use-cases/auth/login.use-case';
import { RefreshTokenUseCase } from '@application/use-cases/auth/refresh-token.use-case';
import {
  RegisterDto,
  RegisterSchema,
} from '@application/dtos/auth/register.dto';
import { LoginDto, LoginSchema } from '@application/dtos/auth/login.dto';
import {
  RefreshTokenDto,
  RefreshTokenSchema,
} from '@application/dtos/auth/refresh-token.dto';
import { AuthResponseDto } from '@application/dtos/auth/auth-response.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
  ) {}

  @Public()
  @Post('register')
  @UsePipes(new ZodValidationPipe(RegisterSchema))
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.registerUseCase.execute(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(LoginSchema))
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.loginUseCase.execute(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  @UsePipes(new ZodValidationPipe(RefreshTokenSchema))
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.refreshTokenUseCase.execute(dto);
  }
}
