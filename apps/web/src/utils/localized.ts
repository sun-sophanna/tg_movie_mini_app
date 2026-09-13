import { localizedField } from '@movie/shared';

export function movieTitle(
  movie: { title: string; titleKh?: string | null },
  locale: string,
): string {
  return localizedField(movie.title, movie.titleKh, locale);
}
