import { createHmac, timingSafeEqual } from 'crypto';

/** @param exp Unix expiry time in seconds (string) */
export function signPlaybackStream(secret: string, episodeId: string, exp: string): string {
  return createHmac('sha256', secret)
    .update(`${episodeId}:${exp}`)
    .digest('base64url');
}

export function verifyPlaybackStreamSignature(
  secret: string,
  episodeId: string,
  exp: string,
  signature: string,
): boolean {
  if (!signature || !exp) return false;
  const expected = signPlaybackStream(secret, episodeId, exp);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

/** @param exp Unix expiry time in seconds (string) */
export function isPlaybackStreamExpired(exp: string, graceMs = 30_000): boolean {
  const unix = Number(exp);
  if (!Number.isFinite(unix) || unix <= 0) {
    return true;
  }
  return Date.now() > unix * 1000 + graceMs;
}
