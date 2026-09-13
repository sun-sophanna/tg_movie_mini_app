import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { MovieEntity } from '../../movies/entities/movie.entity';
import { EpisodeEntity } from '../../episodes/entities/episode.entity';

export enum SeasonStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Entity('seasons')
@Unique(['movieId', 'seasonNumber'])
export class SeasonEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'movie_id' })
  movieId!: string;

  @ManyToOne(() => MovieEntity, (m) => m.seasons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'movie_id' })
  movie!: MovieEntity;

  @Column({ type: 'int', name: 'season_number' })
  seasonNumber!: number;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'title_kh' })
  titleKh!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true, name: 'poster_url' })
  posterUrl!: string | null;

  @Column({ type: 'enum', enum: SeasonStatus })
  status!: SeasonStatus;

  @OneToMany(() => EpisodeEntity, (e) => e.season)
  episodes!: EpisodeEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
