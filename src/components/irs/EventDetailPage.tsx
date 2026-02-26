'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardBody,
    CardHeader,
    Chip,
    Progress,
    Skeleton,
} from '@heroui/react';
import { Button } from '@heroui/react';
import {
    ArrowLeft,
    AlertTriangle,
    TrendingUp,
    Activity,
    AlertCircle,
    BarChart3,
    MapPin,
    Target,
    Shield,
} from 'lucide-react';
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
} from 'recharts';
import { colorTypes, Incident } from '@/types';
import { parseIncidentDates } from '@/lib/action/irs';
import RecentIncidents from './EventsDetailSections/RecentIncidents';

interface EventPageProps {
    teamDeployed: string;
}

// Define proper types for chart data
interface MonthlyIncidentData {
    month: string;
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
}

interface TooltipPayload {
    name: string;
    value: number;
    color: string;
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: TooltipPayload[];
    label?: string;
}

const EventDetailPage = ({ teamDeployed }: EventPageProps) => {
    const router = useRouter();

    const [incidentsData, setIncidentsData] = useState<Incident[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch incidents data
    const fetchIncidentsData = async () => {
        try {
            const response = await fetch('/api/irs/incidents');
            if (!response.ok) {
                throw new Error('Failed to fetch incidents data');
            }
            const data = await response.json();
            setIncidentsData(data.map(parseIncidentDates));
        } catch (error) {
            console.error('Error fetching incidents data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidentsData();
    }, []);

    // Filter incidents for this team
    const teamIncidents = useMemo(() => {
        return incidentsData.filter(
            (incident) => incident.teamDeployed === teamDeployed
        );
    }, [incidentsData, teamDeployed]);

    // Process data for severity chart
    const severityChartData = useMemo(() => {
        const severityCount = teamIncidents.reduce(
            (acc, incident) => {
                acc[incident.severity] = (acc[incident.severity] || 0) + 1;
                return acc;
            },
            {} as { [key: string]: number }
        );

        return Object.entries(severityCount).map(([severity, count]) => ({
            severity,
            count,
            percentage: ((count / teamIncidents.length) * 100).toFixed(1),
        }));
    }, [teamIncidents]);

    // Process data for category chart
    const categoryChartData = useMemo(() => {
        const categoryCount = teamIncidents.reduce(
            (acc, incident) => {
                acc[incident.category] = (acc[incident.category] || 0) + 1;
                return acc;
            },
            {} as { [key: string]: number }
        );

        return Object.entries(categoryCount).map(([category, count]) => ({
            category:
                category.length > 15
                    ? category.substring(0, 15) + '...'
                    : category,
            fullCategory: category,
            count,
        }));
    }, [teamIncidents]);

    // Process data for timeline chart (incidents over time)
    const timelineChartData = useMemo(() => {
        const monthlyData = teamIncidents.reduce(
            (acc, incident) => {
                const date = new Date(incident.date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!acc[monthKey]) {
                    acc[monthKey] = {
                        month: monthKey,
                        total: 0,
                        critical: 0,
                        high: 0,
                        medium: 0,
                        low: 0,
                    };
                }

                acc[monthKey].total++;
                const severityKey =
                    incident.severity.toLowerCase() as keyof Omit<
                        MonthlyIncidentData,
                        'month' | 'total'
                    >;
                if (severityKey in acc[monthKey]) {
                    acc[monthKey][severityKey]++;
                }

                return acc;
            },
            {} as { [key: string]: MonthlyIncidentData }
        );

        return Object.values(monthlyData).sort((a, b) =>
            a.month.localeCompare(b.month)
        );
    }, [teamIncidents]);

    // Process location data
    const locationChartData = useMemo(() => {
        const locationCount = teamIncidents.reduce(
            (acc, incident) => {
                acc[incident.location] = (acc[incident.location] || 0) + 1;
                return acc;
            },
            {} as { [key: string]: number }
        );

        return Object.entries(locationCount)
            .map(([location, count]) => ({
                location:
                    location.length > 20
                        ? location.substring(0, 20) + '...'
                        : location,
                fullLocation: location,
                count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10); // Top 10 locations
    }, [teamIncidents]);

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return '#ef4444';
            case 'high':
                return '#f59e0b';
            case 'medium':
                return '#3b82f6';
            case 'low':
                return '#22c55e';
            default:
                return '#6b7280';
        }
    };

    const getOverallRiskScore = () => {
        if (teamIncidents.length === 0)
            return { score: 0, label: 'No Data', color: 'default' };

        const severityWeights = { critical: 4, high: 3, medium: 2, low: 1 };
        const totalWeight = teamIncidents.reduce((sum, incident) => {
            return (
                sum +
                (severityWeights[
                    incident.severity.toLowerCase() as keyof typeof severityWeights
                ] || 1)
            );
        }, 0);

        const maxPossibleWeight = teamIncidents.length * 4;
        const riskScore = (totalWeight / maxPossibleWeight) * 100;

        if (riskScore >= 75)
            return { score: riskScore, label: 'High Risk', color: 'danger' };
        if (riskScore >= 50)
            return { score: riskScore, label: 'Medium Risk', color: 'warning' };
        if (riskScore >= 25)
            return { score: riskScore, label: 'Low Risk', color: 'primary' };
        return { score: riskScore, label: 'Minimal Risk', color: 'success' };
    };

    const riskScore = getOverallRiskScore();

    // Custom tooltip for charts
    const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
        if (active && payload && payload.length) {
            return (
                <Card className="p-3 shadow-lg border">
                    <CardBody className="p-0">
                        <div className="space-y-1">
                            <p className="font-semibold text-sm">{label}</p>
                            {payload.map((entry, index) => (
                                <div
                                    key={index}
                                    className="flex justify-between items-center"
                                >
                                    <span
                                        className="text-xs"
                                        style={{ color: entry.color }}
                                    >
                                        {entry.name}:
                                    </span>
                                    <span className="text-xs font-medium">
                                        {entry.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardBody>
                </Card>
            );
        }
        return null;
    };

    if (loading) {
        return (
            <div className="bg-gray-50 min-h-screen p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header Skeleton */}
                    <div className="mb-8">
                        <div className="flex items-center gap-4 mb-4">
                            <Skeleton className="w-32 h-10 rounded-lg">
                                <div className="h-10"></div>
                            </Skeleton>
                        </div>
                        <div className="flex items-center gap-3 mb-2">
                            <Skeleton className="w-8 h-8 rounded">
                                <div className="h-8"></div>
                            </Skeleton>
                            <Skeleton className="w-64 h-8 rounded-lg">
                                <div className="h-8"></div>
                            </Skeleton>
                        </div>
                        <Skeleton className="w-80 h-4 rounded-lg">
                            <div className="h-4"></div>
                        </Skeleton>
                    </div>

                    {/* Stats Cards Skeleton */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {Array.from({ length: 4 }).map((_, index) => (
                            <Card
                                key={index}
                                className="bg-gradient-to-r from-gray-50 to-gray-100"
                            >
                                <CardBody className="flex flex-row items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-lg">
                                        <div className="h-10"></div>
                                    </Skeleton>
                                    <div className="flex-1">
                                        <Skeleton className="w-20 h-3 rounded mb-1">
                                            <div className="h-3"></div>
                                        </Skeleton>
                                        <Skeleton className="w-12 h-6 rounded">
                                            <div className="h-6"></div>
                                        </Skeleton>
                                    </div>
                                </CardBody>
                            </Card>
                        ))}
                    </div>

                    {/* Recent Incidents Skeleton */}
                    <Card className="mb-8">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-5 h-5 rounded">
                                    <div className="h-5"></div>
                                </Skeleton>
                                <Skeleton className="w-40 h-6 rounded-lg">
                                    <div className="h-6"></div>
                                </Skeleton>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <Card key={index} className="border">
                                        <CardBody>
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <Skeleton className="w-48 h-6 rounded-lg mb-2">
                                                        <div className="h-6"></div>
                                                    </Skeleton>
                                                    <Skeleton className="w-full h-4 rounded-lg mb-2">
                                                        <div className="h-4"></div>
                                                    </Skeleton>
                                                </div>
                                                <Skeleton className="w-16 h-6 rounded-full">
                                                    <div className="h-6"></div>
                                                </Skeleton>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {Array.from({ length: 4 }).map(
                                                    (_, i) => (
                                                        <div
                                                            key={i}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <Skeleton className="w-3 h-3 rounded">
                                                                <div className="h-3"></div>
                                                            </Skeleton>
                                                            <Skeleton className="w-20 h-3 rounded">
                                                                <div className="h-3"></div>
                                                            </Skeleton>
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        </CardBody>
                    </Card>

                    {/* Risk Assessment Skeleton */}
                    <Card className="mb-8">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-5 h-5 rounded">
                                    <div className="h-5"></div>
                                </Skeleton>
                                <Skeleton className="w-48 h-6 rounded-lg">
                                    <div className="h-6"></div>
                                </Skeleton>
                            </div>
                        </CardHeader>
                        <CardBody>
                            <div className="space-y-4">
                                <Skeleton className="w-full h-8 rounded-lg">
                                    <div className="h-8"></div>
                                </Skeleton>
                                <Skeleton className="w-80 h-4 rounded-lg">
                                    <div className="h-4"></div>
                                </Skeleton>
                            </div>
                        </CardBody>
                    </Card>

                    {/* Charts Grid Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {Array.from({ length: 2 }).map((_, index) => (
                            <Card key={index}>
                                <CardHeader>
                                    <div className="flex items-center gap-2">
                                        <Skeleton className="w-5 h-5 rounded">
                                            <div className="h-5"></div>
                                        </Skeleton>
                                        <Skeleton className="w-40 h-6 rounded-lg">
                                            <div className="h-6"></div>
                                        </Skeleton>
                                    </div>
                                </CardHeader>
                                <CardBody>
                                    <Skeleton className="w-full h-64 rounded-lg">
                                        <div className="h-64"></div>
                                    </Skeleton>
                                </CardBody>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Button
                            variant="flat"
                            color="primary"
                            startContent={<ArrowLeft className="w-4 h-4" />}
                            onPress={() => router.back()}
                        >
                            Back to MiSalud Dashboard
                        </Button>
                    </div>
                    <div className="flex items-center gap-3 mb-2">
                        <AlertTriangle className="w-8 h-8 text-red-600" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Team {teamDeployed} - Incident Analysis
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Aggregated incident data and risk analysis
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-r from-red-50 to-red-100">
                        <CardBody className="flex flex-row items-center gap-3">
                            <div className="p-2 bg-red-500 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Total Incidents
                                </p>
                                <p className="text-2xl font-bold text-red-700">
                                    {teamIncidents.length}
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-orange-50 to-orange-100">
                        <CardBody className="flex flex-row items-center gap-3">
                            <div className="p-2 bg-orange-500 rounded-lg">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Risk Score
                                </p>
                                <p className="text-2xl font-bold text-orange-700">
                                    {riskScore.score.toFixed(0)}%
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
                        <CardBody className="flex flex-row items-center gap-3">
                            <div className="p-2 bg-blue-500 rounded-lg">
                                <MapPin className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">
                                    Locations
                                </p>
                                <p className="text-2xl font-bold text-blue-700">
                                    {
                                        new Set(
                                            teamIncidents.map((i) => i.location)
                                        ).size
                                    }
                                </p>
                            </div>
                        </CardBody>
                    </Card>

                    <Card className="bg-gradient-to-r from-purple-50 to-purple-100">
                        <CardBody className="flex flex-row items-center gap-3">
                            <div className="p-2 bg-purple-500 rounded-lg">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <Chip
                                    size="sm"
                                    color={riskScore.color as colorTypes}
                                    variant="flat"
                                >
                                    {riskScore.label}
                                </Chip>
                            </div>
                        </CardBody>
                    </Card>
                </div>

                {/* Recent Incidents List */}
                {teamIncidents.length > 0 && (
                    <RecentIncidents
                        teamIncidents={teamIncidents}
                        loading={loading}
                    />
                )}

                {/* Risk Score Progress */}
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-gray-600" />
                            <h2 className="text-xl font-semibold text-gray-900">
                                Overall Risk Assessment
                            </h2>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            <Progress
                                size="lg"
                                value={riskScore.score}
                                color={riskScore.color as colorTypes}
                                showValueLabel={true}
                                className="max-w-md"
                                aria-labelledby="progress"
                                aria-valuenow={riskScore.score}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                                <BarChart3 className="w-4 h-4" />
                                Based on {teamIncidents.length} incidents with
                                weighted severity analysis
                            </p>
                        </div>
                    </CardBody>
                </Card>

                {/* Charts Grid */}
                {teamIncidents.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Severity Distribution */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-gray-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Severity Distribution
                                    </h2>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className="w-full h-[300px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <PieChart>
                                            <Pie
                                                data={severityChartData}
                                                cx="50%"
                                                cy="50%"
                                                labelLine={false}
                                                label={({
                                                    severity,
                                                    percentage,
                                                }) =>
                                                    `${severity}: ${percentage}%`
                                                }
                                                outerRadius={80}
                                                fill="#8884d8"
                                                dataKey="count"
                                            >
                                                {severityChartData.map(
                                                    (entry, index) => (
                                                        <Cell
                                                            key={`cell-${index}`}
                                                            fill={getSeverityColor(
                                                                entry.severity
                                                            )}
                                                        />
                                                    )
                                                )}
                                            </Pie>
                                            <Tooltip
                                                content={<CustomTooltip />}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Category Breakdown */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-gray-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Incident Categories
                                    </h2>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className="w-full h-[300px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={categoryChartData}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 60,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#f0f0f0"
                                            />
                                            <XAxis
                                                dataKey="category"
                                                angle={-45}
                                                textAnchor="end"
                                                height={80}
                                                fontSize={12}
                                            />
                                            <YAxis fontSize={12} />
                                            <Tooltip
                                                content={<CustomTooltip />}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="#3b82f6"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Timeline Chart */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-gray-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Incident Timeline
                                    </h2>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className="w-full h-[400px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <LineChart
                                            data={timelineChartData}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 20,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#f0f0f0"
                                            />
                                            <XAxis
                                                dataKey="month"
                                                fontSize={12}
                                            />
                                            <YAxis fontSize={12} />
                                            <Tooltip
                                                content={<CustomTooltip />}
                                            />
                                            <Legend />
                                            <Line
                                                type="monotone"
                                                dataKey="total"
                                                stroke="#3b82f6"
                                                strokeWidth={3}
                                                name="Total"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="critical"
                                                stroke="#ef4444"
                                                strokeWidth={2}
                                                name="Critical"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="high"
                                                stroke="#f59e0b"
                                                strokeWidth={2}
                                                name="High"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="medium"
                                                stroke="#3b82f6"
                                                strokeWidth={2}
                                                name="Medium"
                                            />
                                            <Line
                                                type="monotone"
                                                dataKey="low"
                                                stroke="#22c55e"
                                                strokeWidth={2}
                                                name="Low"
                                            />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardBody>
                        </Card>

                        {/* Top Locations */}
                        <Card className="lg:col-span-2">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-gray-600" />
                                    <h2 className="text-xl font-semibold text-gray-900">
                                        Top Incident Locations
                                    </h2>
                                </div>
                            </CardHeader>
                            <CardBody>
                                <div className="w-full h-[300px]">
                                    <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                    >
                                        <BarChart
                                            data={locationChartData}
                                            margin={{
                                                top: 20,
                                                right: 30,
                                                left: 20,
                                                bottom: 80,
                                            }}
                                        >
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#f0f0f0"
                                            />
                                            <XAxis
                                                dataKey="location"
                                                angle={-45}
                                                textAnchor="end"
                                                height={100}
                                                fontSize={12}
                                            />
                                            <YAxis fontSize={12} />
                                            <Tooltip
                                                content={<CustomTooltip />}
                                            />
                                            <Bar
                                                dataKey="count"
                                                fill="#8b5cf6"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardBody>
                        </Card>
                    </div>
                ) : (
                    <Card className="mb-8">
                        <CardBody className="text-center py-12">
                            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                No Incidents Found
                            </h3>
                            <p className="text-gray-500">
                                No incident data available for Team{' '}
                                {teamDeployed}
                            </p>
                        </CardBody>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default EventDetailPage;
