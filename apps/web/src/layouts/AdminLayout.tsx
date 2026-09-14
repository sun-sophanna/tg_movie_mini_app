import { Layout, Menu, Typography, Button, theme, ConfigProvider } from 'antd';
import {
  DashboardOutlined,
  VideoCameraOutlined,
  LogoutOutlined,
  PlaySquareOutlined,
} from '@ant-design/icons';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { clearStoredAdminKey } from '../api/adminClient';

const { Header, Sider, Content } = Layout;

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const selected = location.pathname.startsWith('/admin/movies') ? 'movies' : 'dashboard';

  function logout() {
    clearStoredAdminKey();
    navigate('/admin/login', { replace: true });
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: { colorPrimary: '#1677ff', borderRadius: 8 },
      }}
    >
      <Layout className="min-h-screen">
        <Sider breakpoint="lg" collapsedWidth={0} theme="light" width={240}>
          <div className="px-4 py-5">
            <Typography.Title level={4} className="!mb-0 !text-slate-800">
              Movie Admin
            </Typography.Title>
            <Typography.Text type="secondary" className="text-xs">
              Catalog & episodes
            </Typography.Text>
          </div>
          <Menu
            mode="inline"
            selectedKeys={[selected]}
            items={[
              {
                key: 'dashboard',
                icon: <DashboardOutlined />,
                label: 'Dashboard',
                onClick: () => navigate('/admin'),
              },
              {
                key: 'movies',
                icon: <VideoCameraOutlined />,
                label: 'Movies & videos',
                onClick: () => navigate('/admin/movies'),
              },
            ]}
          />
          <div className="absolute bottom-4 left-0 w-full px-4">
            <Button block icon={<LogoutOutlined />} onClick={logout}>
              Sign out
            </Button>
          </div>
        </Sider>
        <Layout>
          <Header className="flex items-center justify-between bg-white px-6 shadow-sm">
            <Typography.Text type="secondary">
              <PlaySquareOutlined className="mr-2" />
              Telegram Movie Mini App — management
            </Typography.Text>
            <Button type="link" href="/" target="_blank" rel="noreferrer">
              Open viewer app
            </Button>
          </Header>
          <Content className="m-4 rounded-lg bg-white p-6 shadow-sm md:m-6">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
