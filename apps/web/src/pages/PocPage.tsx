import { Alert, Button, Input, Typography } from 'antd';
import { useState } from 'react';
import { apiGet } from '../api/client';
import { PlaybackSourceDto } from '@movie/types';

/** Minimal Telegram video POC page (Phase 0). */
export function PocPage() {
  const [episodeId, setEpisodeId] = useState('');
  const [source, setSource] = useState<PlaybackSourceDto | null>(null);
  const [error, setError] = useState('');

  async function resolve() {
    setError('');
    try {
      const data = await apiGet<PlaybackSourceDto>(`/episodes/${episodeId}/play`);
      setSource(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
      setSource(null);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <Typography.Title level={4}>Telegram video POC</Typography.Title>
      <Alert
        type="info"
        showIcon
        message="Manual verification"
        description="Use a real episode UUID and bot token. Document results in docs/telegram-video-poc.md."
      />
      <Input placeholder="Episode UUID" value={episodeId} onChange={(e) => setEpisodeId(e.target.value)} />
      <Button type="primary" onClick={resolve} disabled={!episodeId}>
        Resolve /play
      </Button>
      {error && <Alert type="error" message={error} />}
      {source && (
        <>
          <p className="text-xs text-zinc-400 break-all">Provider: {source.provider}</p>
          <p className="text-xs text-zinc-500 break-all">{source.url}</p>
          <video controls className="w-full" src={source.url} playsInline preload="metadata" />
        </>
      )}
    </div>
  );
}
