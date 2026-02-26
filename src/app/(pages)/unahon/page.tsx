import Header from '@/components/Header';
import Unahon from '@/components/unahon/Unahon';
import { auth } from '@/lib/auth';

const UnahonSummaryPage = async () => {
    const session = await auth();

    return (
        // TODO: Don't show unahon form when competency is null. Apply necessary UI component to show a message to the user.
        <div>
            <Header session={session} />
            <Unahon session={session} />
        </div>
    );
};

export default UnahonSummaryPage;
