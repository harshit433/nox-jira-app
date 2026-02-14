import { redirect } from 'next/navigation';
import { AuthGuard } from '@/components/auth/auth-guard';
import { Dashboard } from '@/components/dashboard/dashboard';

export default function Home() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
