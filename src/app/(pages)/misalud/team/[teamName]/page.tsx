import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import TeamDetailPage from '@/components/misalud/TeamDetailPage';
import { auth } from '@/lib/auth';

interface TeamPageProps {
    params: Promise<{
        teamName: string;
    }>;
}

const TeamPage = async ({ params }: TeamPageProps) => {
    const session = await auth();
    const { teamName } = await params;

    // ✅ Only ADMIN/RESPONDER can access MiSalud team pages
    const role = session?.user?.role;
    const canAccess = session && (role === 'ADMIN' || role === 'RESPONDER');

    if (!canAccess) {
        redirect('/overview/misalud');
    }

    return (
        <div>
            <Header session={session} />
            <TeamDetailPage teamName={decodeURIComponent(teamName)} />
        </div>
    );
};

export default TeamPage;
