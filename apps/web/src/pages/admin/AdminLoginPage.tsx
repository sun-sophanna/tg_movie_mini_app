import { Alert, Button, Card, Form, Input, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminGet, setStoredAdminKey } from '../../api/adminClient';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? '/admin';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onFinish(values: { key: string }) {
    setError('');
    setLoading(true);
    setStoredAdminKey(values.key.trim());
    try {
      await adminGet('/admin/dashboard/stats');
      navigate(from, { replace: true });
    } catch {
      setStoredAdminKey('');
      setError('Invalid admin key or admin API not configured on the server.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-md">
        <Typography.Title level={3} className="!mb-1">
          Admin sign in
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Enter the <code>ADMIN_API_KEY</code> from <code>apps/api/.env</code>.
        </Typography.Paragraph>
        {error && <Alert type="error" message={error} className="mb-4" showIcon />}
        <Form layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="key"
            label="Admin API key"
            rules={[{ required: true, message: 'Key is required' }]}
          >
            <Input.Password placeholder="Your ADMIN_API_KEY" autoComplete="off" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Continue to dashboard
          </Button>
        </Form>
      </Card>
    </div>
  );
}
