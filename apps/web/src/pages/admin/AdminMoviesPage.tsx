import { Button, Input, Select, Space, Table, Tag, Typography, message } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminMovieDto, MovieStatus, MovieType, PaginatedResponse } from '@movie/types';
import { adminDelete, adminGet } from '../../api/adminClient';

const statusColors: Record<MovieStatus, string> = {
  ACTIVE: 'green',
  DRAFT: 'default',
  INACTIVE: 'red',
  COMING_SOON: 'blue',
};

export function AdminMoviesPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<MovieStatus | undefined>();
  const [searchInput, setSearchInput] = useState('');

  const query = useQuery({
    queryKey: ['admin', 'movies', page, search, status],
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      if (status) params.set('status', status);
      return adminGet<PaginatedResponse<AdminMovieDto>>(`/admin/movies?${params}`);
    },
  });

  async function onDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}" and all its episodes?`)) return;
    try {
      await adminDelete(`/admin/movies/${id}`);
      message.success('Movie deleted');
      query.refetch();
    } catch {
      message.error('Could not delete movie');
    }
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <Typography.Title level={3} className="!mb-0">
            Movies
          </Typography.Title>
          <Typography.Text type="secondary">Manage titles, posters, and video episodes</Typography.Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/admin/movies/new')}>
          Add movie
        </Button>
      </div>

      <Space wrap className="mb-4">
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search title or slug"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onPressEnter={() => {
            setSearch(searchInput);
            setPage(1);
          }}
          style={{ width: 260 }}
          allowClear
        />
        <Select
          placeholder="Status"
          allowClear
          style={{ width: 160 }}
          value={status}
          onChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
          options={[
            { value: 'ACTIVE', label: 'Active' },
            { value: 'DRAFT', label: 'Draft' },
            { value: 'INACTIVE', label: 'Inactive' },
            { value: 'COMING_SOON', label: 'Coming soon' },
          ]}
        />
        <Button
          onClick={() => {
            setSearch(searchInput);
            setPage(1);
          }}
        >
          Search
        </Button>
      </Space>

      <Table
        rowKey="id"
        loading={query.isLoading}
        dataSource={query.data?.items ?? []}
        pagination={{
          current: page,
          total: query.data?.total,
          pageSize: query.data?.limit ?? 20,
          onChange: setPage,
          showTotal: (t) => `${t} movies`,
        }}
        columns={[
          {
            title: 'Title',
            dataIndex: 'title',
            render: (title: string, row: AdminMovieDto) => (
              <Link to={`/admin/movies/${row.id}`} className="font-medium text-blue-600">
                {title}
              </Link>
            ),
          },
          { title: 'Slug', dataIndex: 'slug', responsive: ['md'] },
          {
            title: 'Type',
            dataIndex: 'type',
            render: (t: MovieType) => (t === 'SERIES' ? 'Series' : 'Movie'),
          },
          {
            title: 'Status',
            dataIndex: 'status',
            render: (s: MovieStatus) => <Tag color={statusColors[s]}>{s}</Tag>,
          },
          { title: 'Episodes', dataIndex: 'episodeCount', width: 90 },
          {
            title: 'Featured',
            dataIndex: 'isFeatured',
            render: (v: boolean) => (v ? 'Yes' : '—'),
            width: 90,
          },
          {
            title: 'Actions',
            key: 'actions',
            render: (_: unknown, row: AdminMovieDto) => (
              <Space>
                <Button size="small" onClick={() => navigate(`/admin/movies/${row.id}`)}>
                  Edit
                </Button>
                <Button size="small" danger onClick={() => onDelete(row.id, row.title)}>
                  Delete
                </Button>
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
