// This is a Server Component (no 'use client' directive)
import { auth } from '@/lib/auth';
import Header from '@/components/Header';
import Map from '@/components/redas/GIS';

export default async function GISPage() {
    // Fetch session on the server
    const session = await auth();

    // Pass session to client component
    return (
        <div className="flex flex-col h-[100dvh]">
            <Header session={session} />
            <div className="flex-1 overflow-hidden">
                <Map />
            </div>
        </div>
    );
}
