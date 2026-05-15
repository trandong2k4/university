import AuthProvider from '@/store/auth.store';
import { RouterProvider } from 'react-router';
import { router } from './routes/AppRoutes';
import { SpeedInsights } from '@vercel/speed-insights/react';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <SpeedInsights />
    </AuthProvider>
  );
}
