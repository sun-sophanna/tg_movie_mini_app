import { useEffect, useMemo, useState } from 'react';
import { useAppStore } from '../store/app-store';

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void;
        expand: () => void;
        initData: string;
        initDataUnsafe: { user?: { id: number; first_name?: string; language_code?: string } };
        colorScheme: 'light' | 'dark';
        themeParams: Record<string, string>;
        BackButton: { show: () => void; hide: () => void; onClick: (cb: () => void) => void };
        viewportHeight: number;
        viewportStableHeight: number;
      };
    };
  }
}

const MOCK_INIT_DATA =
  'mock:' +
  JSON.stringify({
    id: 100001,
    first_name: 'Dev',
    username: 'dev_user',
    language_code: 'en',
  });

let cachedInitData: string | null = null;

export function getTelegramInitData(): string {
  if (cachedInitData) {
    return cachedInitData;
  }
  const mockEnabled = import.meta.env.VITE_ENABLE_TELEGRAM_MOCK === 'true';
  const webApp = window.Telegram?.WebApp;
  if (webApp?.initData) {
    cachedInitData = webApp.initData;
    return cachedInitData;
  }
  if (mockEnabled) {
    cachedInitData = MOCK_INIT_DATA;
    return cachedInitData;
  }
  return '';
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const setLocale = useAppStore((s) => s.setLocale);

  const webApp = window.Telegram?.WebApp;
  const isTelegram = Boolean(webApp?.initData);

  useEffect(() => {
    if (webApp) {
      webApp.ready();
      webApp.expand();
      const lang = webApp.initDataUnsafe.user?.language_code;
      if (lang?.startsWith('km')) {
        setLocale('km');
      }
    }
    setIsReady(true);
  }, [webApp, setLocale]);

  return useMemo(
    () => ({
      webApp,
      user: webApp?.initDataUnsafe.user,
      initData: getTelegramInitData(),
      colorScheme: webApp?.colorScheme ?? 'dark',
      isTelegram,
      isReady,
    }),
    [webApp, isTelegram, isReady],
  );
}
