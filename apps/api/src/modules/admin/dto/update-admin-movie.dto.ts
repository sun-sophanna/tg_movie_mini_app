import { PartialType } from '@nestjs/swagger';
import { CreateAdminMovieDto } from './create-admin-movie.dto';

export class UpdateAdminMovieDto extends PartialType(CreateAdminMovieDto) {}
