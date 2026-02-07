import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './prisma';
import { RedisService } from './redis';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'unknown',
        redis: 'unknown',
      },
    };

    // Check database
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.services.database = 'healthy';
    } catch {
      health.services.database = 'unhealthy';
      health.status = 'degraded';
    }

    // Check Redis
    try {
      await this.redis.set('health_check', 'ok', 10);
      const value = await this.redis.get('health_check');
      health.services.redis = value === 'ok' ? 'healthy' : 'unhealthy';
    } catch {
      health.services.redis = 'unhealthy';
      health.status = 'degraded';
    }

    return health;
  }
}
