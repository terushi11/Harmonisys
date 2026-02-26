import Header from '@/components/Header';
import EventDetailPage from '@/components/irs/EventDetailPage';
import { auth } from '@/lib/auth';

interface EventPageProps {
    params: Promise<{
        eventName: string;
    }>;
}

const EventPage = async ({ params }: EventPageProps) => {
    const session = await auth();
    const { eventName } = await params;

    return (
        <div>
            <Header session={session} />
            <EventDetailPage teamDeployed={decodeURIComponent(eventName)} />
        </div>
    );
};

export default EventPage;
