import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { TelegramAuthGuard } from './telegram-auth.guard';
import { TelegramAuthService } from './telegram-auth.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [TelegramAuthService, TelegramAuthGuard],
  exports: [TelegramAuthService, TelegramAuthGuard],
})
export class AuthModule {}
