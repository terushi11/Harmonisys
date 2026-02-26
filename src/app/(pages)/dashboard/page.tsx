import Header from '@/components/Header';
import Dashboard from '@/components/dashboard/Dashboard';
import { auth } from '@/lib/auth';

const DashboardPage = async () => {
    const session = await auth();

    return (
        <div>
            <Header session={session} />
            <Dashboard session={session} />
        </div>
    );
};

export default DashboardPage;
