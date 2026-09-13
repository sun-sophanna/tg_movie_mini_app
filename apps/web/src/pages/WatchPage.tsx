import { Skeleton } from 'antd';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { VideoPlayer } from '../features/player/VideoPlayer';
import { usePlaybackSource, useWatchHistory } from '../hooks/useApi';
import { getVideoElementSrc } from '../utils/playback';

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

  const videoSrc = playback.data ? getVideoElementSrc(playback.data, episodeId) : '';

  if (!videoSrc) {
    return <p className="p-4 text-zinc-400">Unable to load playback source.</p>;
  }

  return (
    <VideoPlayer
      key={`${videoSrc}-${retry}`}
      episodeId={episodeId}
      src={videoSrc}
      mimeType={playback.data?.mimeType}
      initialPosition={initialPosition}
      onNeedRefresh={async () => {
        setRetry((r) => r + 1);
        await playback.refetch();
      }}
    />
  );
}
