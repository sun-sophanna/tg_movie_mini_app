import { existsSync } from 'fs';
import { join, resolve, sep } from 'path';

/** Map absolute file_path from Local Bot API (--local) to a readable path on the Nest host. */
export function mapTelegramLocalPathToHost(
  filePath: string,
  containerRoot: string,
  hostRoot: string,
): string | null {
  const normalizedContainer = containerRoot.replace(/\\/g, '/').replace(/\/$/, '');
  const normalizedFile = filePath.replace(/\\/g, '/');
  const prefix = `${normalizedContainer}/`;
  if (!normalizedFile.startsWith(prefix)) {
    return null;
  }

  const relative = normalizedFile.slice(prefix.length);
  if (!relative || relative.includes('..')) {
    return null;
  }

  const hostBase = resolve(hostRoot);
  const resolved = resolve(hostBase, ...relative.split('/'));
  const hostBaseWithSep = hostBase.endsWith(sep) ? hostBase : hostBase + sep;
  if (!resolved.startsWith(hostBaseWithSep) && resolved !== hostBase) {
    return null;
  }
  if (!existsSync(resolved)) {
    return null;
  }
  return resolved;
}

/** Default bind-mount target when using docker-compose.dev.yml telegram-bot-api service. */
export function defaultLocalBotApiHostRoot(cwd: string = process.cwd()): string {
  return join(cwd, '.data', 'telegram-bot-api');
}
