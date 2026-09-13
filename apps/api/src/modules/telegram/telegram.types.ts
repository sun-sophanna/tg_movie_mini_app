export interface TelegramVideoReference {
  telegramFileId: string;
  telegramFileUniqueId?: string;
  telegramMessageId?: string;
  telegramChatId?: string;
}

export interface TelegramFileResponse {
  ok: boolean;
  result?: {
    file_id: string;
    file_unique_id: string;
    file_size?: number;
    file_path?: string;
  };
  description?: string;
}
