import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TelegramFileService } from './telegram-file.service';

@Module({
  imports: [HttpModule],
  providers: [TelegramFileService],
  exports: [TelegramFileService],
})
export class TelegramModule {}
