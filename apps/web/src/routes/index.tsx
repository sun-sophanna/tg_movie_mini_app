import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Spin } from 'antd';
import { AppLayout } from '../layouts/AppLayout';

const HomePage = lazy(() => import('../pages/HomePage').then((m) => ({ default: m.HomePage })));
const SearchPage = lazy(() => import('../pages/SearchPage').then((m) => ({ default: m.SearchPage })));
const MovieDetailPage = lazy(() =>
  import('../pages/MovieDetailPage').then((m) => ({ default: m.MovieDetailPage })),
);
const WatchPage = lazy(() => import('../pages/WatchPage').then((m) => ({ default: m.WatchPage })));
const PocPage = lazy(() => import('../pages/PocPage').then((m) => ({ default: m.PocPage })));
const FavoritesPage = lazy(() =>
  import('../pages/FavoritesPage').then((m) => ({ default: m.FavoritesPage })),
);
const HistoryPage = lazy(() =>
  import('../pages/HistoryPage').then((m) => ({ default: m.HistoryPage })),
);
const CategoriesPage = lazy(() =>
  import('../pages/CategoriesPage').then((m) => ({ default: m.CategoriesPage })),
);
const CategoryMoviesPage = lazy(() =>
  import('../pages/CategoryMoviesPage').then((m) => ({ default: m.CategoryMoviesPage })),
);

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<Spin className="m-8 block" />}>{children}</Suspense>;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Lazy><HomePage /></Lazy>} />
        <Route path="search" element={<Lazy><SearchPage /></Lazy>} />
        <Route path="categories" element={<Lazy><CategoriesPage /></Lazy>} />
        <Route path="category/:slug" element={<Lazy><CategoryMoviesPage /></Lazy>} />
        <Route path="movie/:slug" element={<Lazy><MovieDetailPage /></Lazy>} />
        <Route path="watch/:episodeId" element={<Lazy><WatchPage /></Lazy>} />
        <Route path="favorites" element={<Lazy><FavoritesPage /></Lazy>} />
        <Route path="history" element={<Lazy><HistoryPage /></Lazy>} />
        <Route path="poc" element={<Lazy><PocPage /></Lazy>} />
      </Route>
    </Routes>
  );
}
