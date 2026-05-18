import AuthProvider from '@/store/auth.store';
import { RouterProvider } from 'react-router';
import { router } from './routes/AppRoutes';
import { Toaster } from 'sonner';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </AuthProvider>
  );
}
