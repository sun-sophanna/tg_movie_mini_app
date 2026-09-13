/** Default Telegram Bot API (20 MB getFile limit). */
export const TELEGRAM_API_BASE_DEFAULT = 'https://api.telegram.org';

/** Standard cloud Bot API maximum file size for getFile / direct download. */
export const TELEGRAM_CLOUD_MAX_FILE_BYTES = 20 * 1024 * 1024;

export const TELEGRAM_REQUEST_TIMEOUT_MS_DEFAULT = 15_000;

export function normalizeTelegramBaseUrl(url: string): string {
  return url.trim().replace(/\/+$/, '');
}

export function isCloudTelegramApiBase(baseUrl: string): boolean {
  return normalizeTelegramBaseUrl(baseUrl) === TELEGRAM_API_BASE_DEFAULT;
}

/** Path segment for Local Bot API /file/bot<token>/… URLs (avoids double slashes). */
export function formatTelegramFilePathForUrl(filePath: string): string {
  return filePath.replace(/^\/+/, '');
}
