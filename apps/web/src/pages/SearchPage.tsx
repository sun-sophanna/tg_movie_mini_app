import { Input, Skeleton } from 'antd';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MovieCard } from '../components/MovieCard';
import { useMovies } from '../hooks/useApi';

export function SearchPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const [term, setTerm] = useState(params.get('q') ?? '');

  useEffect(() => {
    const handle = setTimeout(() => {
      if (term) params.set('q', term);
      else params.delete('q');
      setParams(params, { replace: true });
    }, 400);
    return () => clearTimeout(handle);
  }, [term, params, setParams]);

  const q = params.get('q') ?? '';
  const movies = useMovies({ search: q, page: 1, limit: 20 });

  return (
    <div className="space-y-4 px-4 py-4">
      <Input
        size="large"
        placeholder={t('search.placeholder')}
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        allowClear
      />
      {movies.isLoading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {movies.data?.items.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      )}
      {!movies.isLoading && (movies.data?.items.length ?? 0) === 0 && (
        <p className="text-center text-zinc-400">{t('search.empty')}</p>
      )}
    </div>
  );
}
