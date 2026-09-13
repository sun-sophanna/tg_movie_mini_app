import { PlaybackSourceDto } from '@movie/types';

export function apiV1Base(): string {
  return (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1').replace(/\/$/, '');
}

/** URL for HTML5 `<video src>` — must be `/stream`, not `/play` or `/playback`. */
export function getVideoElementSrc(source: PlaybackSourceDto, episodeId: string): string {
  const { url } = source;
  if (!url) {
    return url;
  }

  if (url.includes('/play') || url.includes('/playback')) {
    console.error(
      `[playback] Invalid video URL (looks like metadata endpoint): ${url}. episodeId=${episodeId}`,
    );
    return url;
  }

  if (!url.includes('/stream')) {
    if (source.provider === 'telegram') {
      console.warn(
        '[playback] Expected /stream URL for Telegram. Restart API or check TELEGRAM_PLAYBACK_PROXY. Got:',
        url,
      );
    }
    return url;
  }

  try {
    const parsed = new URL(url);
    const apiOrigin = new URL(apiV1Base()).origin;
    if (parsed.origin === apiOrigin) {
      return url;
    }
    return `${apiV1Base()}${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}
