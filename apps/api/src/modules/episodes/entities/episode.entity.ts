import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MovieEntity } from '../../movies/entities/movie.entity';
import { SeasonEntity } from '../../seasons/entities/season.entity';

export enum EpisodeStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('episodes')
export class EpisodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'movie_id' })
  movieId!: string;

  @ManyToOne(() => MovieEntity, (m) => m.episodes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie!: MovieEntity;

  @Column({ type: 'uuid', nullable: true, name: 'season_id' })
  seasonId!: string | null;

  @ManyToOne(() => SeasonEntity, (s) => s.episodes, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'season_id' })
  season!: SeasonEntity | null;

  @Column({ type: 'int', name: 'episode_number' })
  episodeNumber!: number;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'title_kh' })
  titleKh!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true, name: 'description_kh' })
  descriptionKh!: string | null;

  @Column({ type: 'text', nullable: true, name: 'thumbnail_url' })
  thumbnailUrl!: string | null;

  @Column({ type: 'int', nullable: true, name: 'duration_seconds' })
  durationSeconds!: number | null;

  @Column({ type: 'text', name: 'telegram_file_id' })
  telegramFileId!: string;

  @Column({ type: 'text', nullable: true, name: 'telegram_file_unique_id' })
  telegramFileUniqueId!: string | null;

  @Column({ type: 'bigint', nullable: true, name: 'telegram_message_id' })
  telegramMessageId!: string | null;

  @Column({ type: 'bigint', nullable: true, name: 'telegram_chat_id' })
  telegramChatId!: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'mime_type' })
  mimeType!: string | null;

  @Column({ type: 'bigint', nullable: true, name: 'file_size_bytes' })
  fileSizeBytes!: string | null;

  @Column({ type: 'enum', enum: EpisodeStatus })
  status!: EpisodeStatus;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
