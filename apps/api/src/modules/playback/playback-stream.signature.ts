import { createHmac, timingSafeEqual } from 'crypto';

export function signPlaybackStream(
  secret: string,
  episodeId: string,
  expiresAtIso: string,
): string {
  return createHmac('sha256', secret)
    .update(`${episodeId}:${expiresAtIso}`)
    .digest('base64url');
}

export function verifyPlaybackStreamSignature(
  secret: string,
  episodeId: string,
  expiresAtIso: string,
  signature: string,
): boolean {
  if (!signature) return false;
  const expected = signPlaybackStream(secret, episodeId, expiresAtIso);
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function isPlaybackStreamExpired(expiresAtIso: string): boolean {
  const exp = Date.parse(expiresAtIso);
  if (Number.isNaN(exp)) return true;
  return Date.now() > exp;
}
