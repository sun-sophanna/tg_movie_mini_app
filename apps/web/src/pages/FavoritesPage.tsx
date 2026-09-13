import { Empty, Skeleton } from 'antd';
import { MovieCard } from '../components/MovieCard';
import { useFavorites } from '../hooks/useApi';

export function FavoritesPage() {
  const favorites = useFavorites();
  if (favorites.isLoading) return <Skeleton active className="m-4" />;
  if (!favorites.data?.length) return <Empty className="mt-12" description="No favorites yet" />;
  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3">
      {favorites.data.map((m) => (
        <MovieCard key={m.id} movie={m} />
      ))}
    </div>
  );
}
