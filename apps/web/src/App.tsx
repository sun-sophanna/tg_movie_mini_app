import { useTelegram } from './hooks/useTelegram';
import { AppRoutes } from './routes';

export function App() {
  useTelegram();
  return <AppRoutes />;
}
