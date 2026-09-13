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
import { TaxonomyStatus } from '../../categories/entities/category.entity';

@Entity('banners')
export class BannerEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', nullable: true, name: 'movie_id' })
  movieId!: string | null;

  @ManyToOne(() => MovieEntity, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'movie_id' })
  movie!: MovieEntity | null;

  @Column({ type: 'varchar', nullable: true })
  title!: string | null;

  @Column({ type: 'varchar', nullable: true, name: 'title_kh' })
  titleKh!: string | null;

  @Column({ type: 'text', name: 'image_url' })
  imageUrl!: string;

  @Column({ type: 'text', nullable: true, name: 'target_url' })
  targetUrl!: string | null;

  @Column({ type: 'int', default: 0, name: 'sort_order' })
  sortOrder!: number;

  @Column({ type: 'enum', enum: TaxonomyStatus })
  status!: TaxonomyStatus;

  @Column({ type: 'timestamptz', nullable: true, name: 'start_at' })
  startAt!: Date | null;

  @Column({ type: 'timestamptz', nullable: true, name: 'end_at' })
  endAt!: Date | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}
