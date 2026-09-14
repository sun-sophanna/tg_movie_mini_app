import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { mapTelegramLocalPathToHost } from './telegram-local-files.util';

describe('mapTelegramLocalPathToHost', () => {
  const hostRoot = join(process.cwd(), '.tmp-telegram-local-files-test');
  const containerRoot = '/var/lib/telegram-bot-api';

  beforeEach(() => {
    mkdirSync(join(hostRoot, 'bot-token', 'videos'), { recursive: true });
  });

  afterEach(() => {
    rmSync(hostRoot, { recursive: true, force: true });
  });

  it('maps container absolute path to host bind mount', () => {
    const rel = join(hostRoot, 'bot-token', 'videos', 'file_0');
    writeFileSync(rel, 'video-bytes');

    const mapped = mapTelegramLocalPathToHost(
      '/var/lib/telegram-bot-api/bot-token/videos/file_0',
      containerRoot,
      hostRoot,
    );

    expect(mapped).toBe(rel);
  });

  it('rejects path traversal', () => {
    const mapped = mapTelegramLocalPathToHost(
      '/var/lib/telegram-bot-api/../etc/passwd',
      containerRoot,
      hostRoot,
    );
    expect(mapped).toBeNull();
  });
});
