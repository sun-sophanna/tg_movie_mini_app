import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AdminEpisodeDto,
  AdminMovieDto,
  CategoryGenreDto,
  MovieStatus,
  MovieType,
} from '@movie/types';
import { adminDelete, adminGet, adminPatch, adminPost } from '../../api/adminClient';
import { AdminEpisodeModal } from './AdminEpisodeModal';

export function AdminMovieFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [episodeModal, setEpisodeModal] = useState<AdminEpisodeDto | null | 'new'>(null);

  const categories = useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: () => adminGet<CategoryGenreDto[]>('/admin/categories'),
  });

  const movie = useQuery({
    queryKey: ['admin', 'movie', id],
    queryFn: () => adminGet<AdminMovieDto>(`/admin/movies/${id}`),
    enabled: !isNew,
  });

  const episodes = useQuery({
    queryKey: ['admin', 'episodes', id],
    queryFn: () => adminGet<AdminEpisodeDto[]>(`/admin/movies/${id}/episodes`),
    enabled: !isNew,
  });

  useEffect(() => {
    if (movie.data) {
      form.setFieldsValue({
        ...movie.data,
        rating: movie.data.rating != null ? Number(movie.data.rating) : undefined,
      });
    }
  }, [movie.data, form]);

  async function saveMovie() {
    const values = await form.validateFields();
    setSaving(true);
    try {
      if (isNew) {
        const created = await adminPost<AdminMovieDto>('/admin/movies', values);
        message.success('Movie created');
        navigate(`/admin/movies/${created.id}`, { replace: true });
      } else {
        await adminPatch(`/admin/movies/${id}`, values);
        message.success('Movie saved');
        movie.refetch();
      }
    } catch {
      message.error('Could not save movie');
    } finally {
      setSaving(false);
    }
  }

  async function deleteEpisode(ep: AdminEpisodeDto) {
    if (!window.confirm(`Delete episode #${ep.episodeNumber}?`)) return;
    await adminDelete(`/admin/episodes/${ep.id}`);
    message.success('Episode deleted');
    episodes.refetch();
    movie.refetch();
  }

  const nextEp =
    (episodes.data?.reduce((m, e) => Math.max(m, e.episodeNumber), 0) ?? 0) + 1;

  return (
    <div>
      <Button type="link" icon={<ArrowLeftOutlined />} className="!px-0 mb-2">
        <Link to="/admin/movies">Back to movies</Link>
      </Button>

      <Typography.Title level={3}>{isNew ? 'New movie' : 'Edit movie'}</Typography.Title>

      <Form form={form} layout="vertical" initialValues={{ type: 'MOVIE', status: 'DRAFT' }}>
        <Row gutter={24}>
          <Col xs={24} lg={14}>
            <Card title="Details" className="mb-4">
              <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                <Input placeholder="English title" />
              </Form.Item>
              <Form.Item name="titleKh" label="Title (Khmer)">
                <Input />
              </Form.Item>
              <Form.Item name="slug" label="URL slug" extra="Leave empty to auto-generate from title">
                <Input placeholder="my-movie-title" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={4} />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                    <Select
                      options={[
                        { value: 'MOVIE' as MovieType, label: 'Single movie' },
                        { value: 'SERIES' as MovieType, label: 'Series' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                    <Select
                      options={[
                        { value: 'ACTIVE' as MovieStatus, label: 'Active (visible in app)' },
                        { value: 'DRAFT' as MovieStatus, label: 'Draft' },
                        { value: 'INACTIVE' as MovieStatus, label: 'Inactive' },
                        { value: 'COMING_SOON' as MovieStatus, label: 'Coming soon' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>
          <Col xs={24} lg={10}>
            <Card title="Media & meta" className="mb-4">
              <Form.Item name="posterUrl" label="Poster URL">
                <Input placeholder="https://…" />
              </Form.Item>
              <Form.Item name="backdropUrl" label="Backdrop URL">
                <Input placeholder="https://…" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="releaseYear" label="Year">
                    <InputNumber className="w-full" min={1900} max={2100} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="rating" label="Rating">
                    <InputNumber className="w-full" min={0} max={10} step={0.1} />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item name="durationMinutes" label="Duration (minutes)">
                <InputNumber className="w-full" min={1} />
              </Form.Item>
              <Form.Item name="categoryIds" label="Categories">
                <Select
                  mode="multiple"
                  loading={categories.isLoading}
                  options={(categories.data ?? []).map((c) => ({
                    value: c.id,
                    label: c.name,
                  }))}
                  placeholder="Select categories"
                />
              </Form.Item>
              <Space size="large">
                <Form.Item name="isFeatured" label="Featured" valuePropName="checked">
                  <Switch />
                </Form.Item>
                <Form.Item name="isTrending" label="Trending" valuePropName="checked">
                  <Switch />
                </Form.Item>
              </Space>
            </Card>
            <Button type="primary" block size="large" loading={saving} onClick={saveMovie}>
              {isNew ? 'Create movie' : 'Save changes'}
            </Button>
          </Col>
        </Row>
      </Form>

      {!isNew && (
        <Card
          title="Episodes & Telegram video"
          className="mt-6"
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setEpisodeModal('new')}>
              Add video
            </Button>
          }
        >
          <Alert
            type="info"
            showIcon
            className="mb-4"
            message="Each episode needs a telegram_file_id"
            description="Upload to your private channel, forward to the bot, copy file_id from getUpdates. Large files need Local Bot API (see docs)."
          />
          <Table
            rowKey="id"
            loading={episodes.isLoading}
            dataSource={episodes.data ?? []}
            pagination={false}
            columns={[
              { title: '#', dataIndex: 'episodeNumber', width: 60 },
              { title: 'Title', dataIndex: 'title' },
              {
                title: 'Status',
                dataIndex: 'status',
                render: (s: string) => (
                  <Tag color={s === 'ACTIVE' ? 'green' : 'default'}>{s}</Tag>
                ),
              },
              {
                title: 'File ID',
                dataIndex: 'telegramFileId',
                ellipsis: true,
                render: (v: string) => (
                  <Typography.Text code className="text-xs">
                    {v.slice(0, 24)}…
                  </Typography.Text>
                ),
              },
              {
                title: 'Actions',
                render: (_: unknown, row: AdminEpisodeDto) => (
                  <Space>
                    <Button size="small" onClick={() => setEpisodeModal(row)}>
                      Edit
                    </Button>
                    <Button size="small" danger onClick={() => deleteEpisode(row)}>
                      Delete
                    </Button>
                  </Space>
                ),
              },
            ]}
          />
        </Card>
      )}

      {!isNew && id && (
        <AdminEpisodeModal
          open={episodeModal !== null}
          movieId={id}
          episode={episodeModal === 'new' ? null : episodeModal}
          nextEpisodeNumber={nextEp}
          onClose={() => setEpisodeModal(null)}
          onSaved={() => {
            episodes.refetch();
            movie.refetch();
          }}
        />
      )}
    </div>
  );
}
