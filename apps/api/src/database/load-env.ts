import { config } from 'dotenv';
import { existsSync } from 'fs';
import { join } from 'path';

/** Load apps/api/.env when scripts run from monorepo root. */
const envPaths = [join(process.cwd(), 'apps/api/.env'), join(process.cwd(), '.env')];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}
