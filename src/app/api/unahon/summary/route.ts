import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get total assessments
        const totalAssessments = await prisma.unahon.count();

        // Get assessments by type
        const assessmentsByType = await prisma.unahon.groupBy({
            by: ['assessmentType'],
            _count: {
                assessmentType: true,
            },
        });

        // Get recent assessments (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentAssessments = await prisma.unahon.count({
            where: {
                date: {
                    gte: thirtyDaysAgo,
                },
            },
        });

        // Get assessments by responder
        const assessmentsByResponder = await prisma.unahon.groupBy({
            by: ['userId'],
            _count: {
                userId: true,
            },
            orderBy: {
                _count: {
                    userId: 'desc',
                },
            },
            take: 5,
        });

        // Get responder details for top responders
        const topResponders = await Promise.all(
            assessmentsByResponder.map(async (responder) => {
                const user = await prisma.user.findUnique({
                    where: { id: responder.userId },
                    select: { name: true, email: true },
                });
                return {
                    name: user?.name || 'Unknown',
                    email: user?.email,
                    assessmentCount: responder._count.userId,
                };
            })
        );

        const summary = {
            totalAssessments,
            recentAssessments,
            assessmentsByType: assessmentsByType.reduce(
                (acc, item) => {
                    acc[item.assessmentType] = item._count.assessmentType;
                    return acc;
                },
                {} as Record<string, number>
            ),
            topResponders,
            lastUpdated: new Date().toISOString(),
        };

        return NextResponse.json(summary);
    } catch (error) {
        console.error('Error fetching Unahon summary:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Unahon summary' },
            { status: 500 }
        );
    }
}
