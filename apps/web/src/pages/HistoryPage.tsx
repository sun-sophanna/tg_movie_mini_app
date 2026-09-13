import { Empty, Skeleton } from 'antd';
import { Link } from 'react-router-dom';
import { useWatchHistory } from '../hooks/useApi';

export function HistoryPage() {
  const history = useWatchHistory();
  if (history.isLoading) return <Skeleton active className="m-4" />;
  if (!history.data?.length) return <Empty className="mt-12" description="No watch history" />;
  return (
    <ul className="divide-y divide-zinc-800 p-4">
      {history.data.map((item) => (
        <li key={item.id} className="py-3">
          <Link to={`/watch/${item.episodeId}`} className="text-rose-400">
            {item.movie?.title ?? item.movieId}
          </Link>
          <p className="text-xs text-zinc-500">{item.progressPercent}% · {item.lastWatchedAt}</p>
        </li>
      ))}
    </ul>
  );
}
