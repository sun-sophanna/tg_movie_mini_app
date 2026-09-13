import { useParams } from 'react-router-dom';
import { Skeleton } from 'antd';
import { MovieCard } from '../components/MovieCard';
import { useMovies } from '../hooks/useApi';

export function CategoryMoviesPage() {
  const { slug = '' } = useParams();
  const movies = useMovies({ category: slug, page: 1, limit: 24 });
  if (movies.isLoading) return <Skeleton active className="m-4" />;
  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
      {movies.data?.items.map((m) => (
        <MovieCard key={m.id} movie={m} />
      ))}
    </div>
  );
}
