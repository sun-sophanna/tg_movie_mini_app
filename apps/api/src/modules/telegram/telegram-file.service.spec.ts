import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of } from 'rxjs';
import { TelegramFileService } from './telegram-file.service';

describe('TelegramFileService', () => {
  const token = '123456:ABC';

  function createService(config: Record<string, unknown>) {
    const http = {
      get: jest.fn(),
    } as unknown as HttpService;
    const configService = {
      get: (key: string) => config[key],
    } as ConfigService;
    const service = new TelegramFileService(http, configService);
    return { service, http };
  }

  it('uses cloud API by default for getFile', async () => {
    const { service, http } = createService({ TELEGRAM_BOT_TOKEN: token });
    (http.get as jest.Mock).mockReturnValue(
      of({
        data: {
          ok: true,
          result: { file_id: 'x', file_unique_id: 'y', file_path: 'videos/a.mp4' },
        },
      }),
    );

    await service.getFileMetadata('file-id');

    expect(http.get).toHaveBeenCalledWith(
      `https://api.telegram.org/bot${token}/getFile`,
      expect.objectContaining({ params: { file_id: 'file-id' } }),
    );
  });

  it('uses TELEGRAM_API_BASE_URL for getFile when set', async () => {
    const { service, http } = createService({
      TELEGRAM_BOT_TOKEN: token,
      TELEGRAM_API_BASE_URL: 'http://localhost:8081/',
    });
    (http.get as jest.Mock).mockReturnValue(
      of({
        data: {
          ok: true,
          result: { file_id: 'x', file_unique_id: 'y', file_path: 'videos/a.mp4' },
        },
      }),
    );

    await service.getFileMetadata('file-id');

    expect(http.get).toHaveBeenCalledWith(
      `http://localhost:8081/bot${token}/getFile`,
      expect.any(Object),
    );
  });

  it('builds download URL from TELEGRAM_FILE_BASE_URL when set', () => {
    const { service } = createService({
      TELEGRAM_BOT_TOKEN: token,
      TELEGRAM_API_BASE_URL: 'http://telegram-bot-api:8081',
      TELEGRAM_FILE_BASE_URL: 'https://bot-api.example.com',
    });

    const { url } = service.buildFileDownloadUrl('videos/a.mp4');

    expect(url).toBe(`https://bot-api.example.com/file/bot${token}/videos/a.mp4`);
  });

  it('reports local bot API when base URL is not cloud', () => {
    const { service } = createService({
      TELEGRAM_API_BASE_URL: 'http://localhost:8081',
    });
    expect(service.usesLocalBotApi()).toBe(true);
  });
});
