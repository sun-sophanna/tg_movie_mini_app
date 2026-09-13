import { Button, Skeleton, Tabs } from 'antd';
import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { apiGet } from '../api/client';
import { useFavoriteMutation, useMovie } from '../hooks/useApi';
import { useAppStore } from '../store/app-store';
import { movieTitle } from '../utils/localized';
import { useQuery } from '@tanstack/react-query';
import { EpisodeDto } from '@movie/types';

export function MovieDetailPage() {
  const { slug = '' } = useParams();
  const { t } = useTranslation();
  const locale = useAppStore((s) => s.locale);
  const movie = useMovie(slug);
  const favorite = useFavoriteMutation();

  const episodes = useQuery({
    queryKey: ['episodes', movie.data?.id],
    queryFn: () => apiGet<EpisodeDto[]>(`/movies/${movie.data!.id}/episodes`),
    enabled: Boolean(movie.data?.id),
  });

  const title = movie.data ? movieTitle(movie.data, locale) : '';
  const description = useMemo(() => {
    if (!movie.data) return '';
    if (locale.startsWith('km') && movie.data.descriptionKh) return movie.data.descriptionKh;
    return movie.data.description ?? '';
  }, [movie.data, locale]);

  const primaryEpisode = episodes.data?.[0];

  if (movie.isLoading) {
    return <Skeleton active className="p-4" paragraph={{ rows: 8 }} />;
  }

  if (!movie.data) {
    return <p className="p-4 text-zinc-400">{t('movie.notFound')}</p>;
  }

  return (
    <div className="pb-10">
      <div
        className="h-48 bg-cover bg-center"
        style={{ backgroundImage: movie.data.backdropUrl ? `url(${movie.data.backdropUrl})` : undefined }}
      />
      <div className="-mt-12 space-y-4 px-4">
        <div className="flex gap-4">
          <img
            src={movie.data.posterUrl ?? ''}
            alt=""
            className="h-36 w-24 rounded-xl object-cover shadow-lg"
          />
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            <p className="text-sm text-zinc-400">
              {movie.data.releaseYear} · {movie.data.country} · {movie.data.rating}
            </p>
            <div className="mt-3 flex gap-2">
              {primaryEpisode && (
                <Link to={`/watch/${primaryEpisode.id}`}>
                  <Button type="primary">{t('movie.watch')}</Button>
                </Link>
              )}
              <Button
                onClick={() => favorite.mutate({ movieId: movie.data!.id, add: true })}
                loading={favorite.isPending}
              >
                {t('movie.favorite')}
              </Button>
            </div>
          </div>
        </div>
        <p className="text-sm leading-relaxed text-zinc-300">{description}</p>
        <Tabs
          items={[
            {
              key: 'episodes',
              label: t('movie.episodes'),
              children: (
                <ul className="space-y-2">
                  {(episodes.data ?? []).map((ep) => (
                    <li key={ep.id}>
                      <Link to={`/watch/${ep.id}`} className="block rounded-lg bg-zinc-900 px-3 py-2">
                        {ep.episodeNumber}. {ep.title ?? t('movie.episode')}
                      </Link>
                    </li>
                  ))}
                </ul>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
