import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { UserType } from '@prisma/client';

export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                    data: null,
                },
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
                {
                    success: false,
                    error: 'User not found',
                    data: null,
                },
                { status: 404 }
            );
        }

        const isAdmin = currentUser.role === UserType.ADMIN;
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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

        const recentIncidentUserWhere = isAdmin
            ? { createdAt: { gte: thirtyDaysAgo } }
            : {
                  AND: [
                      { createdAt: { gte: thirtyDaysAgo } },
                      {
                          OR: userAliases.map((alias) => ({
                              reporter: {
                                  equals: alias,
                                  mode: 'insensitive' as const,
                              },
                          })),
                      },
                  ],
              };

        const unahonWhere = isAdmin ? {} : { userId: currentUser.id };
        const recentUnahonWhere = isAdmin
            ? { date: { gte: thirtyDaysAgo } }
            : {
                  userId: currentUser.id,
                  date: { gte: thirtyDaysAgo },
              };

        const submissionWhere = isAdmin ? {} : ({ userId: currentUser.id } as any);
        const recentSubmissionWhere = isAdmin
            ? { createdAt: { gte: thirtyDaysAgo } }
            : ({
                  userId: currentUser.id,
                  createdAt: { gte: thirtyDaysAgo },
              } as any);

        // Admin-only global sources
        const [questionnaireStats] = await Promise.allSettled([
            isAdmin
                ? prisma.submission.count()
                : prisma.submission.count({ where: submissionWhere }).catch(() => 0),
        ]);

                const totalIRSEvents = 0;
        const redasTrainingSessions = 0;

        const totalQuestionnaires =
            questionnaireStats.status === 'fulfilled' ? questionnaireStats.value : 0;

        const [
            totalUsers,
            totalIncidents,
            totalUnahonAssessments,
            recentIncidentsCount,
            recentUnahonCount,
            recentSubmissionsCount,
        ] = await Promise.all([
            isAdmin ? prisma.user.count() : Promise.resolve(0),
            prisma.incident.count({
                where: incidentUserWhere,
            }),
            prisma.unahon.count({
                where: unahonWhere,
            }),
            prisma.incident.count({
                where: recentIncidentUserWhere,
            }),
            prisma.unahon.count({
                where: recentUnahonWhere,
            }),
            prisma.submission
                .count({
                    where: recentSubmissionWhere,
                } as any)
                .catch(() => 0),
        ]);

        const dashboardStats = {
            overview: {
                totalUsers,
                totalIncidents,
                totalUnahonAssessments,
                totalQuestionnaires,
                totalIRSEvents,
                redasTrainingSessions,
            },
            recent: {
                recentIncidents: recentIncidentsCount,
                recentUnahonAssessments: recentUnahonCount,
                recentSubmissions: recentSubmissionsCount,
            },
        };

        return NextResponse.json({
            success: true,
            data: dashboardStats,
            message: 'Dashboard statistics retrieved successfully',
        });
    } catch (error) {
        console.error('Error fetching dashboard statistics:', error);

        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch dashboard statistics',
                data: null,
            },
            { status: 500 }
        );
    }
}