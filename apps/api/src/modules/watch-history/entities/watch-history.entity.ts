import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { MovieEntity } from '../../movies/entities/movie.entity';
import { EpisodeEntity } from '../../episodes/entities/episode.entity';

@Entity('watch_history')
@Unique(['userId', 'episodeId'])
export class WatchHistoryEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @Column({ type: 'uuid', name: 'movie_id' })
  movieId!: string;

  @ManyToOne(() => MovieEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie!: MovieEntity;

  @Column({ type: 'uuid', name: 'episode_id' })
  episodeId!: string;

  @ManyToOne(() => EpisodeEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'episode_id' })
  episode!: EpisodeEntity;

  @Column({ type: 'int', default: 0, name: 'position_seconds' })
  positionSeconds!: number;

  @Column({ type: 'int', nullable: true, name: 'duration_seconds' })
  durationSeconds!: number | null;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    default: 0,
    name: 'progress_percent',
  })
  progressPercent!: string;

  @Column({ type: 'boolean', default: false })
  completed!: boolean;

  @Column({ type: 'timestamptz', name: 'last_watched_at' })
  lastWatchedAt!: Date;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
