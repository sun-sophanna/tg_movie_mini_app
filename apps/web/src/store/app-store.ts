import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  locale: 'en' | 'km';
  setLocale: (locale: 'en' | 'km') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      locale: 'en',
      setLocale: (locale) => set({ locale }),
    }),
    { name: 'movie-app' },
  ),
);
