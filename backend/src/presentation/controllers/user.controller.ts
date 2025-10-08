/**
 * Presentation Layer - Controller
 * Handles HTTP requests, validates input using Zod
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { CreateUserUseCase } from '@application/use-cases/create-user.use-case';
import { GetUserUseCase } from '@application/use-cases/get-user.use-case';
import { ListUsersUseCase } from '@application/use-cases/list-users.use-case';
import { CreateUserDto, CreateUserSchema } from '@application/dtos/create-user.dto';
import { UserResponseDto } from '@application/dtos/user-response.dto';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

@Controller('users')
export class UserController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly getUserUseCase: GetUserUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async create(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    return this.createUserUseCase.execute(dto);
  }

  @Get()
  async findAll(): Promise<UserResponseDto[]> {
    return this.listUsersUseCase.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.getUserUseCase.execute(id);
  }
}
