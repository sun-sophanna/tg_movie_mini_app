import { Skeleton } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { VideoPlayer } from '../features/player/VideoPlayer';
import { usePlaybackSource, useWatchHistory } from '../hooks/useApi';

export function WatchPage() {
  const { episodeId = '' } = useParams();
  const [retry, setRetry] = useState(0);
  const playback = usePlaybackSource(episodeId, Boolean(episodeId));
  const history = useWatchHistory();

  const initialPosition =
    history.data?.find((h) => h.episodeId === episodeId)?.positionSeconds ?? 0;

  if (playback.isLoading) {
    return <Skeleton active className="m-4" paragraph={{ rows: 4 }} />;
  }

  if (!playback.data?.url) {
    return <p className="p-4 text-zinc-400">Unable to load playback source.</p>;
  }

  return (
    <VideoPlayer
      key={`${playback.data.url}-${retry}`}
      episodeId={episodeId}
      src={playback.data.url}
      mimeType={playback.data.mimeType}
      initialPosition={initialPosition}
      onNeedRefresh={() => {
        if (retry < 1) {
          setRetry((r) => r + 1);
          playback.refetch();
        }
      }}
    />
  );
}
