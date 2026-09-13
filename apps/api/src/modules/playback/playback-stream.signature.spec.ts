import {
  isPlaybackStreamExpired,
  signPlaybackStream,
  verifyPlaybackStreamSignature,
} from './playback-stream.signature';

describe('playback-stream.signature', () => {
  const secret = 'test-secret';
  const episodeId = 'ceb0078c-215c-45a5-aa12-e2b3a88b4fe6';

  it('signs and verifies unix exp', () => {
    const exp = String(Math.floor(Date.now() / 1000) + 3600);
    const sig = signPlaybackStream(secret, episodeId, exp);
    expect(verifyPlaybackStreamSignature(secret, episodeId, exp, sig)).toBe(true);
    expect(isPlaybackStreamExpired(exp)).toBe(false);
  });

  it('treats invalid exp as expired', () => {
    expect(isPlaybackStreamExpired('')).toBe(true);
    expect(isPlaybackStreamExpired('not-a-number')).toBe(true);
  });
});
