import { Button, Spin } from 'antd';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUpsertWatchHistory } from '../../hooks/useApi';

interface Props {
  episodeId: string;
  src: string;
  mimeType?: string;
  initialPosition?: number;
  onNeedRefresh: () => void;
}

export function VideoPlayer({ episodeId, src, mimeType, initialPosition = 0, onNeedRefresh }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState(false);
  const lastSent = useRef(0);
  const mutate = useUpsertWatchHistory();

  const sendProgress = useCallback(
    (completed = false) => {
      const video = videoRef.current;
      if (!video) return;
      mutate.mutate({
        episodeId,
        body: {
          positionSeconds: Math.floor(video.currentTime),
          durationSeconds: Math.floor(video.duration || 0),
          completed,
        },
      });
    },
    [episodeId, mutate],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onTimeUpdate = () => {
      const now = Date.now();
      if (now - lastSent.current > 15000) {
        lastSent.current = now;
        sendProgress();
      }
    };
    const onPause = () => sendProgress();
    const onEnded = () => sendProgress(true);
    const onError = () => {
      setError(true);
    };
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);
    video.addEventListener('error', onError);
    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('error', onError);
    };
  }, [sendProgress, onNeedRefresh]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || initialPosition <= 0) return;
    const apply = () => {
      if (Number.isFinite(video.duration) && initialPosition < video.duration) {
        video.currentTime = initialPosition;
      }
    };
    video.addEventListener('loadedmetadata', apply);
    if (video.readyState >= 1) apply();
    return () => video.removeEventListener('loadedmetadata', apply);
  }, [src, initialPosition]);

  if (error) {
    return (
      <div className="flex flex-col items-center gap-3 py-12">
        <p className="text-zinc-300">Playback failed.</p>
        <Button type="primary" onClick={() => { setError(false); onNeedRefresh(); }}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="relative w-full bg-black">
      {!src && <Spin className="absolute inset-0 m-auto" />}
      <video
        ref={videoRef}
        key={src}
        className="max-h-[70vh] w-full"
        controls
        playsInline
        preload="metadata"
        src={src}
      >
        {mimeType && <source src={src} type={mimeType} />}
      </video>
    </div>
  );
}
