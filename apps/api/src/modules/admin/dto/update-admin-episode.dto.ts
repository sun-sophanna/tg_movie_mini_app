import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAdminEpisodeDto } from './create-admin-episode.dto';

export class UpdateAdminEpisodeDto extends PartialType(
  OmitType(CreateAdminEpisodeDto, ['movieId'] as const),
) {}
