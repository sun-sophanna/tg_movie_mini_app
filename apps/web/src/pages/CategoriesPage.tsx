import { Link } from 'react-router-dom';
import { Skeleton } from 'antd';
import { useCategories } from '../hooks/useApi';

export function CategoriesPage() {
  const categories = useCategories();
  if (categories.isLoading) return <Skeleton active className="m-4" />;
  return (
    <div className="grid grid-cols-2 gap-3 p-4">
      {categories.data?.map((c) => (
        <Link
          key={c.id}
          to={`/category/${c.slug}`}
          className="rounded-xl bg-zinc-900 p-4 text-center font-medium"
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
