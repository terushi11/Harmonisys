import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Fetch data from the new stats API
        const statsResponse = await fetch(
            `${process.env.NEXT_PUBLIC_BASE_URL}/api/dashboard/stats`
        );
        const statsData = await statsResponse.json();

        if (!statsData.success) {
            throw new Error('Failed to fetch dashboard stats');
        }

        return NextResponse.json({
            success: true,
            data: statsData.data,
            message: 'Dashboard data retrieved successfully',
        });
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch dashboard data',
                data: null,
            },
            { status: 500 }
        );
    }
}
