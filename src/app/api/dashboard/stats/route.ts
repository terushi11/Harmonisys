import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { IRSdb } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export async function GET() {
    try {
        // Fetch data from all sources in parallel
        const [
            userStats,
            incidentStats,
            unahonStats,
            questionnaireStats,
            irsEvents,
            redasStats,
        ] = await Promise.allSettled([
            // User statistics
            prisma.user.groupBy({ by: ['role'], _count: { role: true } }),

            // Incident statistics
            prisma.incident.groupBy({
                by: ['category', 'severity'],
                _count: { category: true },
            }),

            // Unahon statistics
            prisma.unahon.groupBy({
                by: ['assessmentType'],
                _count: { assessmentType: true },
            }),

            // Questionnaire statistics
            prisma.submission.count(),

            // IRS events from Firebase
            getDocs(collection(IRSdb, 'events')),

            // REDAS training data
            fetch(
                `${process.env.NEXT_PUBLIC_BASE_URL}/api/redas?sheetName=Trainings&label=PROVINCES&count=true`
            )
                .then((res) => res.json())
                .catch(() => ({ count: 0 })),
        ]);

        // Process user statistics
        const totalUsers =
            userStats.status === 'fulfilled'
                ? userStats.value.reduce(
                      (sum, item) => sum + item._count.role,
                      0
                  )
                : 0;

        const usersByRole =
            userStats.status === 'fulfilled'
                ? userStats.value.reduce(
                      (acc, item) => {
                          acc[item.role] = item._count.role;
                          return acc;
                      },
                      {} as Record<string, number>
                  )
                : {};

        // Process incident statistics
        const totalIncidents =
            incidentStats.status === 'fulfilled'
                ? incidentStats.value.reduce(
                      (sum, item) => sum + item._count.category,
                      0
                  )
                : 0;

        const incidentsByCategory =
            incidentStats.status === 'fulfilled'
                ? incidentStats.value.reduce(
                      (acc, item) => {
                          acc[item.category] = item._count.category;
                          return acc;
                      },
                      {} as Record<string, number>
                  )
                : {};

        const incidentsBySeverity =
            incidentStats.status === 'fulfilled'
                ? incidentStats.value.reduce(
                      (acc, item) => {
                          acc[item.severity] = item._count.category;
                          return acc;
                      },
                      {} as Record<string, number>
                  )
                : {};

        // Process Unahon statistics
        const totalUnahonAssessments =
            unahonStats.status === 'fulfilled'
                ? unahonStats.value.reduce(
                      (sum, item) => sum + item._count.assessmentType,
                      0
                  )
                : 0;

        const unahonByType =
            unahonStats.status === 'fulfilled'
                ? unahonStats.value.reduce(
                      (acc, item) => {
                          acc[item.assessmentType] = item._count.assessmentType;
                          return acc;
                      },
                      {} as Record<string, number>
                  )
                : {};

        // Process IRS events
        const totalIRSEvents =
            irsEvents.status === 'fulfilled' && !irsEvents.value.empty
                ? irsEvents.value.size
                : 0;

        // Process REDAS data
        const redasTrainingSessions =
            redasStats.status === 'fulfilled' && redasStats.value.count
                ? redasStats.value.count
                : 0;

        // Get recent activities (last 10 incidents)
        const recentIncidents = await prisma.incident.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                location: true,
                summary: true,
                category: true,
                severity: true,
                createdAt: true,
                reporter: true,
                otherCategoryDetail: true,
            },
        });

        // Get top responders (users with most Unahon assessments)
        const topResponders = await prisma.unahon.groupBy({
            by: ['userId'],
            _count: { userId: true },
            orderBy: { _count: { userId: 'desc' } },
            take: 5,
        });

        const topRespondersWithNames = await Promise.all(
            topResponders.map(async (responder) => {
                const user = await prisma.user.findUnique({
                    where: { id: responder.userId },
                    select: { name: true },
                });
                return {
                    name: user?.name || 'Unknown',
                    count: responder._count.userId,
                };
            })
        );

        // Calculate recent activity (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentIncidentsCount = await prisma.incident.count({
            where: { createdAt: { gte: thirtyDaysAgo } },
        });

        const recentUnahonCount = await prisma.unahon.count({
            where: { date: { gte: thirtyDaysAgo } },
        });

        const recentSubmissionsCount = await prisma.submission.count({
            where: { createdAt: { gte: thirtyDaysAgo } },
        });

        const dashboardStats = {
            overview: {
                totalUsers,
                totalIncidents,
                totalUnahonAssessments,
                totalQuestionnaires:
                    questionnaireStats.status === 'fulfilled'
                        ? questionnaireStats.value
                        : 0,
                totalIRSEvents,
                redasTrainingSessions,
            },
            recent: {
                recentIncidents: recentIncidentsCount,
                recentUnahonAssessments: recentUnahonCount,
                recentSubmissions: recentSubmissionsCount,
            },
            breakdown: {
                usersByRole,
                incidentsByCategory,
                incidentsBySeverity,
                unahonByType,
            },
            topResponders: topRespondersWithNames,
            recentActivities: recentIncidents.map((incident) => ({
                tool: 'IRS',
                action:
                    incident.category.toLowerCase() === 'other'
                        ? `New ${incident.otherCategoryDetail!.toLowerCase()} in ${incident.location}`
                        : `New ${incident.severity
                              .toLowerCase()
                              .replace(
                                  /_/g,
                                  ' '
                              )} incident in ${incident.location}`,
                timestamp: incident.createdAt.toISOString(),
                user: incident.reporter || 'Anonymous',
                severity: incident.severity,
            })),
            system: {
                lastUpdated: new Date().toISOString(),
                status: 'operational',
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
