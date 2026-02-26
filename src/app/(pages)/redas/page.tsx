import Header from '@/components/Header';
import REDAS from '@/components/redas/REDAS';
import { auth } from '@/lib/auth';

const REDASPage = async () => {
    const session = await auth();

    return (
        <div>
            <Header session={session} />
            <REDAS />
        </div>
    );
};

export default REDASPage;
