import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTelegram } from '../hooks/useTelegram';

const showBack = (path: string) =>
  path.startsWith('/movie/') || path.startsWith('/watch/') || path.startsWith('/category/');

export function AppLayout() {
  const { webApp } = useTelegram();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!webApp?.BackButton) return;
    if (showBack(location.pathname)) {
      webApp.BackButton.show();
      webApp.BackButton.onClick(() => navigate(-1));
    } else {
      webApp.BackButton.hide();
    }
  }, [location.pathname, navigate, webApp]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 flex justify-around border-t border-zinc-800 bg-zinc-950/95 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] text-xs">
        <a href="/">Home</a>
        <a href="/search">Search</a>
        <a href="/favorites">Favorites</a>
        <a href="/history">History</a>
      </nav>
    </div>
  );
}
