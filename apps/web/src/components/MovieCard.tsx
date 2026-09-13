import { Link } from 'react-router-dom';
import { MovieListItemDto } from '@movie/types';
import { useAppStore } from '../store/app-store';
import { movieTitle } from '../utils/localized';

export function MovieCard({ movie }: { movie: MovieListItemDto }) {
  const locale = useAppStore((s) => s.locale);
  return (
    <Link to={`/movie/${movie.slug}`} className="block w-36 shrink-0">
      <div className="aspect-[2/3] overflow-hidden rounded-xl bg-zinc-800">
        {movie.posterUrl ? (
          <img src={movie.posterUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-zinc-500">No poster</div>
        )}
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium">{movieTitle(movie, locale)}</p>
      <p className="text-xs text-zinc-400">
        {movie.releaseYear ?? '—'} {movie.rating ? `· ${movie.rating}` : ''}
      </p>
    </Link>
  );
}
