export function localizedField(
  en: string | null | undefined,
  km: string | null | undefined,
  locale: string,
): string {
  if (locale.startsWith('km') && km?.trim()) {
    return km;
  }
  return en?.trim() ?? km?.trim() ?? '';
}

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 50;
