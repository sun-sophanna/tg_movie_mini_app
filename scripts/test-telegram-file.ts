import '../apps/api/src/database/load-env';
import axios from 'axios';

const fileId = process.argv[2];
const token = process.env.TELEGRAM_BOT_TOKEN;
const apiBase = (process.env.TELEGRAM_API_BASE_URL ?? 'https://api.telegram.org').replace(/\/$/, '');
const fileBase = (process.env.TELEGRAM_FILE_BASE_URL ?? (apiBase.includes('8081') ? 'http://localhost:8082' : apiBase)).replace(
  /\/$/,
  '',
);

async function main() {
  if (!fileId || !token) {
    console.error('Usage: test-telegram-file.ts <file_id> (needs TELEGRAM_BOT_TOKEN)');
    process.exit(1);
  }
  const getFileUrl = `${apiBase}/bot${token}/getFile`;
  const gf = await axios.get(getFileUrl, { params: { file_id: fileId } });
  console.log('getFile ok:', gf.data.ok, 'path:', gf.data.result?.file_path);
  if (!gf.data.result?.file_path) return;
  const fp: string = gf.data.result.file_path;
  let rel = fp;
  if (fp.startsWith('/var/lib/telegram-bot-api/')) {
    const afterRoot = fp.slice('/var/lib/telegram-bot-api/'.length);
    const slash = afterRoot.indexOf('/');
    rel = slash > 0 ? afterRoot.slice(slash + 1) : fp;
  } else if (fp.includes('/videos/')) {
    rel = fp.slice(fp.indexOf('/videos/') + 1);
  } else {
    rel = fp.replace(/^\//, '');
  }
  const nginxUrl = `${fileBase}/file/bot${token}/${rel}`;
  console.log('try nginx/file URL:', nginxUrl.replace(token, '<token>'));
  try {
    const head = await axios.get(nginxUrl, {
      headers: { Range: 'bytes=0-1023' },
      validateStatus: () => true,
      maxRedirects: 0,
    });
    console.log('download status', head.status, 'type', head.headers['content-type']);
  } catch (e) {
    console.log('download error', e);
  }
}

main();
