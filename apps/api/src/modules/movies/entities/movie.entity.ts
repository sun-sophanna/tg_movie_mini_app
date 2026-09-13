import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from '../../categories/entities/category.entity';
import { GenreEntity } from '../../genres/entities/genre.entity';
import { SeasonEntity } from '../../seasons/entities/season.entity';
import { EpisodeEntity } from '../../episodes/entities/episode.entity';

export enum MovieType {
  MOVIE = 'MOVIE',
  SERIES = 'SERIES',
}

export enum MovieStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  COMING_SOON = 'COMING_SOON',
}

@Entity('movies')
export class MovieEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar', nullable: true, name: 'title_kh' })
  titleKh!: string | null;

  @Column({ type: 'varchar', unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true, name: 'description_kh' })
  descriptionKh!: string | null;

  @Column({ type: 'text', nullable: true, name: 'poster_url' })
  posterUrl!: string | null;

  @Column({ type: 'text', nullable: true, name: 'backdrop_url' })
  backdropUrl!: string | null;

  @Column({ type: 'int', nullable: true, name: 'release_year' })
  releaseYear!: number | null;

  @Column({ type: 'int', nullable: true, name: 'duration_minutes' })
  durationMinutes!: number | null;

  @Column({ type: 'numeric', precision: 3, scale: 1, nullable: true })
  rating!: string | null;

  @Column({ type: 'varchar', nullable: true })
  country!: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'original_language' })
  originalLanguage!: string | null;

  @Column({ type: 'enum', enum: MovieType })
  type!: MovieType;

  @Column({ type: 'enum', enum: MovieStatus })
  status!: MovieStatus;

  @Column({ type: 'boolean', default: false, name: 'is_featured' })
  isFeatured!: boolean;

  @Column({ type: 'boolean', default: false, name: 'is_trending' })
  isTrending!: boolean;

  @Column({ type: 'timestamptz', nullable: true, name: 'published_at' })
  publishedAt!: Date | null;

  @ManyToMany(() => CategoryEntity, (c) => c.movies)
  @JoinTable({
    name: 'movie_categories',
    joinColumn: { name: 'movie_id' },
    inverseJoinColumn: { name: 'category_id' },
  })
  categories!: CategoryEntity[];

  @ManyToMany(() => GenreEntity, (g) => g.movies)
  @JoinTable({
    name: 'movie_genres',
    joinColumn: { name: 'movie_id' },
    inverseJoinColumn: { name: 'genre_id' },
  })
  genres!: GenreEntity[];

  @OneToMany(() => SeasonEntity, (s) => s.movie)
  seasons!: SeasonEntity[];

  @OneToMany(() => EpisodeEntity, (e) => e.movie)
  episodes!: EpisodeEntity[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
