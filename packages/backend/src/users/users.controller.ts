import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@CurrentUser('id') userId: string) {
    return this.users.getMe(userId);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.users.updateMe(userId, dto);
  }

  @Get(':username')
  async getPublicProfile(@Param('username') username: string) {
    const profile = await this.users.getPublicProfile(username);
    if (!profile) throw new NotFoundException('User not found');
    return profile;
  }
}
