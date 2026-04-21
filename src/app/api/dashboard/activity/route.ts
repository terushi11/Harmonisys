import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UserType } from '@prisma/client';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized', data: [] },
                { status: 401 }
            );
        }

        const currentUser = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        if (!currentUser) {
            return NextResponse.json(
                { success: false, error: 'User not found', data: [] },
                { status: 404 }
            );
        }

        const isAdmin = currentUser.role === UserType.ADMIN;

        const userAliases = [
            currentUser.name?.trim(),
            currentUser.email?.trim(),
        ].filter(Boolean) as string[];

        const incidentUserWhere = isAdmin
            ? {}
            : {
                  OR: userAliases.map((alias) => ({
                      reporter: {
                          equals: alias,
                          mode: 'insensitive' as const,
                      },
                  })),
              };

        const recentIncidents = await prisma.incident.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            where: incidentUserWhere,
            select: {
                id: true,
                location: true,
                category: true,
                severity: true,
                createdAt: true,
                reporter: true,
                otherCategoryDetail: true,
            },
        });

        const recentActivities = recentIncidents.map((incident) => ({
            tool: 'IRS',
            action:
                incident.category.toLowerCase() === 'other'
                    ? `New ${incident.otherCategoryDetail?.toLowerCase() || 'incident'} in ${incident.location}`
                    : `New ${incident.severity.toLowerCase().replace(/_/g, ' ')} incident in ${incident.location}`,
            timestamp: incident.createdAt.toISOString(),
            user: incident.reporter || 'Anonymous',
            severity: incident.severity,
        }));

        return NextResponse.json({
            success: true,
            data: recentActivities,
        });
    } catch (error) {
        console.error('Error fetching dashboard activity:', error);

        return NextResponse.json(
            { success: false, error: 'Failed to fetch dashboard activity', data: [] },
            { status: 500 }
        );
    }
}