import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface MonthData {
    month: string;
    label: string;
    incidents: number;
    unahon: number;
    submissions: number;
}

export async function GET() {
    try {
        // Get monthly trends for the last 12 months
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

        // Monthly incidents
        const monthlyIncidents = await prisma.incident.groupBy({
            by: ['createdAt'],
            _count: {
                createdAt: true,
            },
            where: {
                createdAt: {
                    gte: twelveMonthsAgo,
                },
            },
        });

        // Monthly Unahon assessments
        const monthlyUnahon = await prisma.unahon.groupBy({
            by: ['date'],
            _count: {
                date: true,
            },
            where: {
                date: {
                    gte: twelveMonthsAgo,
                },
            },
        });

        // Monthly questionnaire submissions
        const monthlySubmissions = await prisma.submission.groupBy({
            by: ['createdAt'],
            _count: {
                createdAt: true,
            },
            where: {
                createdAt: {
                    gte: twelveMonthsAgo,
                },
            },
        });

        // Process monthly data into chart format
        const months: MonthData[] = [];
        const currentDate = new Date(twelveMonthsAgo);

        for (let i = 0; i < 12; i++) {
            const monthKey = currentDate.toISOString().slice(0, 7); // YYYY-MM format
            months.push({
                month: monthKey,
                label: currentDate.toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                }),
                incidents: 0,
                unahon: 0,
                submissions: 0,
            });
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Fill in actual data
        monthlyIncidents.forEach((item) => {
            const monthKey = item.createdAt.toISOString().slice(0, 7);
            const monthIndex = months.findIndex((m) => m.month === monthKey);
            if (monthIndex !== -1) {
                months[monthIndex].incidents = item._count.createdAt;
            }
        });

        monthlyUnahon.forEach((item) => {
            const monthKey = item.date.toISOString().slice(0, 7);
            const monthIndex = months.findIndex((m) => m.month === monthKey);
            if (monthIndex !== -1) {
                months[monthIndex].unahon = item._count.date;
            }
        });

        monthlySubmissions.forEach((item) => {
            const monthKey = item.createdAt.toISOString().slice(0, 7);
            const monthIndex = months.findIndex((m) => m.month === monthKey);
            if (monthIndex !== -1) {
                months[monthIndex].submissions = item._count.createdAt;
            }
        });

        // Get severity distribution
        const severityDistribution = await prisma.incident.groupBy({
            by: ['severity'],
            _count: {
                severity: true,
            },
        });

        // Get category distribution
        const categoryDistribution = await prisma.incident.groupBy({
            by: ['category'],
            _count: {
                category: true,
            },
        });

        // Get assessment type distribution
        const assessmentTypeDistribution = await prisma.unahon.groupBy({
            by: ['assessmentType'],
            _count: {
                assessmentType: true,
            },
        });

        // Get user role distribution
        const userRoleDistribution = await prisma.user.groupBy({
            by: ['role'],
            _count: {
                role: true,
            },
        });

        // Get top locations for incidents
        const topLocations = await prisma.incident.groupBy({
            by: ['location'],
            _count: {
                location: true,
            },
            orderBy: {
                _count: {
                    location: 'desc',
                },
            },
            take: 10,
        });

        // Get recent activity timeline (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentIncidents = await prisma.incident.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
            select: {
                id: true,
                location: true,
                category: true,
                severity: true,
                createdAt: true,
                summary: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const recentUnahon = await prisma.unahon.findMany({
            where: {
                date: {
                    gte: sevenDaysAgo,
                },
            },
            select: {
                id: true,
                client: true,
                assessmentType: true,
                date: true,
                responder: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                date: 'desc',
            },
        });

        const recentSubmissions = await prisma.submission.findMany({
            where: {
                createdAt: {
                    gte: sevenDaysAgo,
                },
            },
            select: {
                id: true,
                name: true,
                team: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        // Combine recent activities
        const recentActivities = [
            ...recentIncidents.map((incident) => ({
                id: incident.id,
                type: 'incident',
                title: `${incident.category} incident in ${incident.location}`,
                description: incident.summary,
                timestamp: incident.createdAt,
                severity: incident.severity,
                tool: 'IRS',
            })),
            ...recentUnahon.map((unahon) => ({
                id: unahon.id,
                type: 'assessment',
                title: `${unahon.assessmentType} assessment for ${unahon.client}`,
                description: `Conducted by ${unahon.responder.name || 'Unknown'}`,
                timestamp: unahon.date,
                tool: 'Unahon',
            })),
            ...recentSubmissions.map((submission) => ({
                id: submission.id,
                type: 'questionnaire',
                title: `Questionnaire submitted by ${submission.name}`,
                description: `Team: ${submission.team}`,
                timestamp: submission.createdAt,
                tool: 'MiSalud',
            })),
        ]
            .sort(
                (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
            )
            .slice(0, 20);

        const chartsData = {
            monthlyTrends: {
                labels: months.map((m) => m.label),
                datasets: [
                    {
                        label: 'Incidents',
                        data: months.map((m) => m.incidents),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    },
                    {
                        label: 'Unahon Assessments',
                        data: months.map((m) => m.unahon),
                        borderColor: '#8b5cf6',
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    },
                    {
                        label: 'Questionnaires',
                        data: months.map((m) => m.submissions),
                        borderColor: '#ec4899',
                        backgroundColor: 'rgba(236, 72, 153, 0.1)',
                    },
                ],
            },
            distributions: {
                severity: severityDistribution.map((item) => ({
                    name: item.severity,
                    value: item._count.severity,
                })),
                category: categoryDistribution.map((item) => ({
                    name: item.category,
                    value: item._count.category,
                })),
                assessmentType: assessmentTypeDistribution.map((item) => ({
                    name: item.assessmentType,
                    value: item._count.assessmentType,
                })),
                userRole: userRoleDistribution.map((item) => ({
                    name: item.role,
                    value: item._count.role,
                })),
            },
            topLocations: topLocations.map((item) => ({
                name: item.location,
                value: item._count.location,
            })),
            recentActivity: recentActivities,
        };

        return NextResponse.json({
            success: true,
            data: chartsData,
            message: 'Dashboard charts data retrieved successfully',
        });
    } catch (error) {
        console.error('Error fetching dashboard charts data:', error);
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch dashboard charts data',
                data: null,
            },
            { status: 500 }
        );
    }
}
