import { Carousel, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MovieCard } from '../components/MovieCard';
import {
  useBanners,
  useCategories,
  useFeaturedMovies,
  useTrendingMovies,
  useWatchHistory,
} from '../hooks/useApi';

export function HomePage() {
  const { t } = useTranslation();
  const banners = useBanners();
  const featured = useFeaturedMovies();
  const trending = useTrendingMovies();
  const categories = useCategories();
  const history = useWatchHistory();

  return (
    <div className="space-y-8 px-4 pb-8 pt-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{t('home.title')}</h1>
        <Link to="/search" className="text-sm text-rose-400">
          {t('home.search')}
        </Link>
      </div>

      {banners.isLoading ? (
        <Skeleton.Image active className="!w-full !h-44" />
      ) : (
        <Carousel autoplay dots className="overflow-hidden rounded-2xl">
          {(banners.data ?? []).map((b) => (
            <div key={b.id}>
              <img src={b.imageUrl} alt="" className="h-44 w-full object-cover" />
            </div>
          ))}
        </Carousel>
      )}

      {(history.data?.length ?? 0) > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-medium">{t('home.continue')}</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {history.data?.slice(0, 8).map((item) =>
              item.movie ? <MovieCard key={item.id} movie={item.movie} /> : null,
            )}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-medium">{t('home.trending')}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {trending.isLoading
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} active className="!w-36 !h-52" />)
            : trending.data?.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">{t('home.featured')}</h2>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {featured.data?.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-medium">{t('home.categories')}</h2>
          <Link to="/categories" className="text-sm text-rose-400">
            {t('home.viewAll')}
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.data?.map((c) => (
            <Link
              key={c.id}
              to={`/category/${c.slug}`}
              className="rounded-full bg-zinc-800 px-4 py-2 text-sm"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
