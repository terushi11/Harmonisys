// app/api/assess/route.ts
import { fetchHazardAssessment } from '@/lib/action/hazardhunter';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { latitude, longitude } = body;

        if (typeof latitude !== 'number' || typeof longitude !== 'number') {
            return new Response(
                JSON.stringify({
                    error: 'Latitude and longitude must be numbers.',
                }),
                { status: 400 }
            );
        }

        const data = await fetchHazardAssessment(latitude, longitude);

        return NextResponse.json(
            { message: 'Ok', data: data },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { message: 'Internal server error', data: null },
            { status: 500 }
        );
    }
}
