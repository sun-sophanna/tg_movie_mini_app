import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { MovieEntity } from '../../movies/entities/movie.entity';

@Entity('favorites')
@Unique(['userId', 'movieId'])
export class FavoriteEntity {
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

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;
}
