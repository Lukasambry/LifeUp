import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/index';
import { UpdateProfileDto } from './dto/update-profile.dto';

const PROFILE_SELECT = {
  id: true,
  email: true,
  username: true,
  bio: true,
  avatarUrl: true,
  isPublic: true,
  level: true,
  totalXp: true,
  class: true,
  ssoProvider: true,
  createdAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: PROFILE_SELECT,
    });
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    if (dto.username) {
      const existing = await this.prisma.user.findFirst({
        where: { username: dto.username, NOT: { id: userId } },
      });
      if (existing) throw new ConflictException('username already in use');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.username !== undefined && { username: dto.username }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
        ...(dto.isPublic !== undefined && { isPublic: dto.isPublic }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
      },
      select: PROFILE_SELECT,
    });
  }

  async getPublicProfile(username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: {
        username: true,
        isPublic: true,
        bio: true,
        avatarUrl: true,
        level: true,
        totalXp: true,
        class: true,
        createdAt: true,
      },
    });

    if (!user) return null;

    if (!user.isPublic) {
      return { username: user.username, isPublic: false };
    }

    return user;
  }
}
