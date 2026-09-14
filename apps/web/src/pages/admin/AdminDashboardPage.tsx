import { Card, Col, Row, Statistic, Typography } from 'antd';
import { useQuery } from '@tanstack/react-query';
import { AdminDashboardStatsDto } from '@movie/types';
import { adminGet } from '../../api/adminClient';

export function AdminDashboardPage() {
  const stats = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => adminGet<AdminDashboardStatsDto>('/admin/dashboard/stats'),
  });

  const s = stats.data;

  return (
    <div>
      <Typography.Title level={3}>Dashboard</Typography.Title>
      <Typography.Paragraph type="secondary">
        Overview of your catalog. Changes appear in the Mini App after cache refresh (saved
        automatically on edit).
      </Typography.Paragraph>
      <Row gutter={[16, 16]} className="mt-4">
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="Movies" value={s?.moviesTotal ?? '—'} loading={stats.isLoading} />
            <Typography.Text type="secondary">{s?.moviesActive ?? 0} active</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic title="Episodes" value={s?.episodesTotal ?? '—'} loading={stats.isLoading} />
            <Typography.Text type="secondary">{s?.episodesActive ?? 0} active</Typography.Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Categories"
              value={s?.categoriesTotal ?? '—'}
              loading={stats.isLoading}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
