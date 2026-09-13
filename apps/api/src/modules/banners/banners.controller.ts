import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../auth/public.decorator';
import { BannersService } from './banners.service';

@ApiTags('banners')
@ApiBearerAuth('tma')
@Public()
@Controller({ path: 'banners', version: '1' })
export class BannersController {
  constructor(private readonly banners: BannersService) {}

  @Get()
  list() {
    return this.banners.listActive();
  }
}
