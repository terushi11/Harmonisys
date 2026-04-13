import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import IncidentDetailsClient from '../ui/IncidentDetailsClient';

export default async function IncidentAdminDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();

  if (!session?.user) redirect('/dashboard');
  if (session.user.role !== 'ADMIN') redirect('/dashboard');

  return <IncidentDetailsClient id={params.id} />;
}