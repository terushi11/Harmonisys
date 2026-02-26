import { redirect } from 'next/navigation';
import Header from '@/components/Header';
import MiSalud from '@/components/misalud/MiSalud';
import { auth } from '@/lib/auth';

const MISALUDPage = async () => {
    const session = await auth();

    // ✅ Only ADMIN/RESPONDER can access MiSalud dashboard
    const role = session?.user?.role;
    const canAccess = session && (role === 'ADMIN' || role === 'RESPONDER');

    if (!canAccess) {
        redirect('/overview/misalud'); // or '/overview/misalud' (use your real overview route)
    }

    return (
        <div>
            <Header session={session} />
            <MiSalud userRole={session?.user?.role} />
        </div>
    );
};

export default MISALUDPage;
