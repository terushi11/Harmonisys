import Header from '@/components/Header';
import { auth } from '@/lib/auth';
import HazardHunter from '@/components/hazardhunter/HazardHunter';

const HazardHunterPage = async () => {
    const session = await auth();

    return (
        <div>
            <Header session={session} />
            <HazardHunter />
        </div>
    );
};

export default HazardHunterPage;
