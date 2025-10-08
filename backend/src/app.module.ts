/**
 * Root Application Module
 */

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '@infrastructure/config/database.module';
import { UserModule } from '@infrastructure/modules/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    UserModule,
  ],
})
export class AppModule {}
