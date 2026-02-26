'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Card,
    CardBody,
    CardHeader,
    Button,
    Skeleton,
    Tabs,
    Tab,
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    useDisclosure,
    Divider,
} from '@heroui/react';
import {
    BarChart3,
    AlertTriangle,
    Heart,
    MapPin,
    ShieldCheck,
    Clock,
    TrendingUp,
    TrendingDown,
    PieChart,
    Users,
    Lightbulb,
    GlobeIcon,
} from 'lucide-react';
import type { Session } from 'next-auth';
import { UserType } from '@prisma/client';
import type { DashboardStats, DashboardChartsData } from '@/types';
import DashboardCharts from './DashboardCharts';
import Image from 'next/image';

interface MetricCardProps {
    title: string;
    value: string | number;
    change: string;
    trend: 'up' | 'down' | 'neutral';
    icon: React.ReactNode;
    color: string;
    loading?: boolean;

    href?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    change,
    trend,
    icon,
    color,
    loading = false,
    href,
}) => {
    const router = useRouter();
    if (loading) {
        return (
            <Card className="bg-white/80 backdrop-blur-xl shadow-xl border border-white/30">
                <CardBody className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-3">
                            <Skeleton className="w-24 h-4 rounded-lg" />
                            <Skeleton className="w-20 h-10 rounded-lg" />
                            <Skeleton className="w-16 h-3 rounded-lg" />
                        </div>
                        <Skeleton className="w-14 h-14 rounded-2xl" />
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
    <Card
    className="bg-white/80 backdrop-blur-xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 group cursor-pointer"
    isPressable={!!href}
    onPress={() => {
        if (href) router.push(href);
    }}
>
            <CardBody className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="flex items-center justify-between relative z-10">
                    <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {title}
                        </p>
                        <p className="text-4xl font-black text-slate-900 group-hover:scale-[1.02] transition-transform duration-300">
                            {typeof value === 'number'
                                ? value.toLocaleString()
                                : value}
                        </p>
                        <div className="flex items-center gap-2">
                            {trend === 'up' ? (
                                <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 rounded-full">
                                    <TrendingUp className="w-3 h-3 text-emerald-700" />
                                    <span className="text-xs font-bold text-emerald-800">
                                        {change}
                                    </span>
                                </div>
                            ) : trend === 'down' ? (
                                <div className="flex items-center gap-1 px-2 py-1 bg-red-100 rounded-full">
                                    <TrendingDown className="w-3 h-3 text-red-700" />
                                    <span className="text-xs font-bold text-red-800">
                                        {change}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
                                    <span className="text-xs font-bold text-slate-700">
                                        {change}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div
                        className={`p-4 rounded-2xl ${color} shadow-xl group-hover:scale-105 transition-all duration-500`}
                    >
                        {icon}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

interface ToolCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    stats: string;
    trend: string;
    color: string;
    href: string;
    loading?: boolean;
    status: 'operational' | 'warning' | 'error';
}

const ToolCard: React.FC<ToolCardProps> = ({
    title,
    description,
    icon,
    stats,
    trend,
    color,
    href,
    loading = false,
}) => {
    const router = useRouter();

    if (loading) {
        return (
            <Card className="bg-white/80 backdrop-blur-xl shadow-xl border border-white/30">
                <CardBody className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <Skeleton className="w-14 h-14 rounded-2xl" />
                        <Skeleton className="w-20 h-6 rounded-full" />
                    </div>
                    <Skeleton className="w-full h-6 rounded-lg mb-3" />
                    <Skeleton className="w-4/5 h-4 rounded-lg mb-6" />
                    <div className="flex items-center justify-between">
                        <Skeleton className="w-20 h-8 rounded-lg" />
                        <Skeleton className="w-24 h-4 rounded-lg" />
                    </div>
                </CardBody>
            </Card>
        );
    }

    return (
        <Card
            className="bg-white/80 backdrop-blur-xl shadow-xl border border-white/30 hover:shadow-2xl transition-all duration-500 cursor-pointer group hover:-translate-y-1"
            isPressable
            onPress={() => router.push(href)}
        >
            <CardBody className="p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/0 group-hover:from-white/10 group-hover:via-white/5 group-hover:to-white/10 transition-all duration-500" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div
                                className={`p-4 rounded-2xl ${color} shadow-xl group-hover:scale-105 transition-all duration-500`}
                            >
                                {icon}
                            </div>

                            <div className="hidden sm:flex flex-col">
                                <span className="text-xs font-semibold text-slate-500">
                                    Tool
                                </span>
                                <span className="text-sm font-bold text-slate-900">
                                    {title}
                                </span>
                            </div>
                        </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-2">
                        {title}
                    </h3>
                    <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                        {description}
                    </p>

                    <Divider className="mb-4" />

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black text-slate-900">
                                {stats}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                                {trend}
                            </span>
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

interface DashboardProps {
    session: Session | null;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
    const router = useRouter();
    const { isOpen, onOpenChange, onOpen } = useDisclosure();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [chartsData, setChartsData] = useState<DashboardChartsData | null>(
        null
    );
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState('overview');

    // Role-based UI
    const role = session?.user?.role as UserType | undefined;
    const isAdmin = role === UserType.ADMIN;
    const isResponder = role === UserType.RESPONDER;
    const isStandard = role === UserType.STANDARD;

    // "My dashboard" view for Responder + Standard
    const isPersonalDashboard = isResponder || isStandard;

    const currentUserEmail = session?.user?.email?.toLowerCase() || '';
    const currentUserName = session?.user?.name?.toLowerCase() || '';

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                const [statsResponse, chartsResponse] = await Promise.all([
                    fetch('/api/dashboard/stats'),
                    fetch('/api/dashboard/charts'),
                ]);

                const statsData = await statsResponse.json();
                const chartsData = await chartsResponse.json();

                if (statsData.success) setStats(statsData.data);
                if (chartsData.success) setChartsData(chartsData.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const toolTheme = {
        irs: 'bg-gradient-to-br from-[#4A0A18] via-[#6B0F25] to-[#8B1538]',
        unahon: 'bg-gradient-to-br from-[#7A0C1E] via-[#991B1B] to-[#B91C1C]',
        misalud:
            'bg-gradient-to-br from-emerald-800 via-emerald-700 to-emerald-600',
        hazardhunter:
            'bg-gradient-to-br from-[#5A3A1A] via-[#7B5A3A] to-[#9D7C5A]',
        redas: 'bg-gradient-to-br from-blue-800 via-blue-700 to-sky-600',
    } as const;

    const allTools = [
        {
            title: 'IRS',
            description:
                'Incident Reporting System for emergency drills and real-time incident tracking',
            icon: <AlertTriangle className="w-7 h-7 text-white" />,
            stats: stats?.overview.totalIncidents.toString() || '0',
            trend: stats?.recent.recentIncidents
                ? `+${stats.recent.recentIncidents} this month`
                : '0 this month',
            color: toolTheme.irs,
            href: '/overview/irs',
            status: 'operational' as const,
        },
        {
            title: 'Mi Salud',
            description:
                'Mental and physical health monitoring for disaster responders',
            icon: <Heart className="w-7 h-7 text-white" />,
            stats: stats?.overview.totalQuestionnaires.toString() || '0',
            trend: stats?.recent.recentSubmissions
                ? `+${stats.recent.recentSubmissions} this month`
                : '0 this month',
            color: toolTheme.misalud,
            href: '/misalud',
            status: 'operational' as const,
        },
        {
            title: 'REDAS',
            description:
                'Rapid Earthquake Damage Assessment System training programs',
            icon: <GlobeIcon className="w-7 h-7 text-white" />,
            stats: stats?.overview.redasTrainingSessions.toString() || '0',
            trend: 'Active training programs',
            color: toolTheme.redas,
            href: '/redas',
            status: 'operational' as const,
        },
        {
            title: 'HazardHunter',
            description:
                'Natural hazard assessment and risk analysis for Philippine locations',
            icon: <MapPin className="w-7 h-7 text-white" />,
            stats: 'Active',
            trend: 'Real-time monitoring',
            color: toolTheme.hazardhunter,
            href: '/hazardhunter',
            status: 'operational' as const,
        },
        {
            title: 'Unahon',
            description:
                'Mental health screening tool for disaster-affected communities',
            icon: <ShieldCheck className="w-7 h-7 text-white" />,
            stats: stats?.overview.totalUnahonAssessments.toString() || '0',
            trend: stats?.recent.recentUnahonAssessments
                ? `+${stats.recent.recentUnahonAssessments} this month`
                : '0 this month',
            color: toolTheme.unahon,
            href: '/unahon',
            status: 'operational' as const,
        },
    ];

    // Tools visible by role:
    // - Standard: remove Mi Salud
    const tools = allTools.filter((t) => {
        if (isStandard && t.title === 'Mi Salud') return false;
        return true;
    });

    const allQuickActions = [
        {
            title: 'Report Incident',
            description: 'Create new incident report',
            icon: <AlertTriangle className="w-6 h-6" />,
            href: '/irs',
            color: 'bg-gradient-to-r from-[#7A0C1E] to-[#B91C1C] hover:from-[#6B0F25] hover:to-[#991B1B] text-white shadow-xl hover:shadow-2xl',
        },
        {
            title: 'Health Assessment',
            description: 'Complete health screening',
            icon: <Heart className="w-6 h-6" />,
            href: '/misalud',
            color: 'bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-800 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl',
        },
        {
            title: 'Hazard Check',
            description: 'Assess location hazards',
            icon: <MapPin className="w-6 h-6" />,
            href: '/hazardhunter',
            color: 'bg-gradient-to-r from-[#5A3A1A] to-[#9D7C5A] hover:from-[#4A3223] hover:to-[#7B5A3A] text-white shadow-xl hover:shadow-2xl',
        },
        {
            title: 'Mental Screening',
            description: 'Start Unahon assessment',
            icon: <ShieldCheck className="w-6 h-6" />,
            href: '/unahon',
            color: 'bg-gradient-to-r from-blue-700 to-sky-600 hover:from-blue-800 hover:to-sky-700 text-white shadow-xl hover:shadow-2xl',
        },
    ];

    // Quick Actions visible by role:
    // - Standard: remove Health Assessment (Mi Salud)
    const quickActions = allQuickActions.filter((a) => {
        if (isStandard && a.href === '/misalud') return false;
        return true;
    });

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    const formatTimeAgo = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor(
            (now.getTime() - date.getTime()) / (1000 * 60)
        );

        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;

        return date.toLocaleDateString();
    };

    // Best-effort "My recent activities"
    const myRecentActivities =
        stats?.recentActivities?.filter((a) => {
            const activityUser = (a.user || '').toLowerCase();
            if (!activityUser) return false;

            if (currentUserEmail && activityUser.includes(currentUserEmail))
                return true;

            if (currentUserName && activityUser.includes(currentUserName))
                return true;

            return false;
        }) || [];

    // Responder Metrics (includes Mi Salud)
    const responderMetrics: MetricCardProps[] = [
        {
            title: 'My Incident Reports',
            value: stats?.overview.totalIncidents || 0,
            change: stats?.recent.recentIncidents
                ? `+${stats.recent.recentIncidents} this month`
                : '0 this month',
            trend: stats?.recent.recentIncidents ? 'up' : 'neutral',
            icon: <AlertTriangle className="w-7 h-7 text-white" />,
            color: 'bg-gradient-to-br from-red-500 via-red-600 to-orange-600',
        },
        {
            title: 'My Health Assessments',
            value: stats?.overview.totalQuestionnaires || 0,
            change: stats?.recent.recentSubmissions
                ? `+${stats.recent.recentSubmissions} this month`
                : '0 this month',
            trend: stats?.recent.recentSubmissions ? 'up' : 'neutral',
            icon: <Heart className="w-7 h-7 text-white" />,
            color: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600',
        },
        {
            title: 'My Unahon Screenings',
            value: stats?.overview.totalUnahonAssessments || 0,
            change: stats?.recent.recentUnahonAssessments
                ? `+${stats.recent.recentUnahonAssessments} this month`
                : '0 this month',
            trend: stats?.recent.recentUnahonAssessments ? 'up' : 'neutral',
            icon: <ShieldCheck className="w-7 h-7 text-white" />,
            color: 'bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600',
        },
        {
            title: 'My Recent Activity',
            value: myRecentActivities.length
                ? formatTimeAgo(myRecentActivities[0].timestamp)
                : '—',
            change: 'Latest action',
            trend: 'neutral',
            icon: <Clock className="w-7 h-7 text-white" />,
            color: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800',
        },
    ];

    // ✅ Standard Metrics: ONLY 3 cards (Incident, Unahon, Recent Activity)
    const standardMetrics: MetricCardProps[] = [
        {
            title: 'My Incident Reports',
            value: stats?.overview.totalIncidents || 0,
            change: stats?.recent.recentIncidents
                ? `+${stats.recent.recentIncidents} this month`
                : '0 this month',
            trend: stats?.recent.recentIncidents ? 'up' : 'neutral',
            icon: <AlertTriangle className="w-7 h-7 text-white" />,
            color: 'bg-gradient-to-br from-red-500 via-red-600 to-orange-600',
        },
        {
            title: 'My Unahon Screenings',
            value: stats?.overview.totalUnahonAssessments || 0,
            change: stats?.recent.recentUnahonAssessments
                ? `+${stats.recent.recentUnahonAssessments} this month`
                : '0 this month',
            trend: stats?.recent.recentUnahonAssessments ? 'up' : 'neutral',
            icon: <ShieldCheck className="w-7 h-7 text-white" />,
            color: 'bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600',
        },
        {
            title: 'My Recent Activity',
            value: myRecentActivities.length
                ? formatTimeAgo(myRecentActivities[0].timestamp)
                : '—',
            change: 'Latest action',
            trend: 'neutral',
            icon: <Clock className="w-7 h-7 text-white" />,
            color: 'bg-gradient-to-br from-slate-600 via-slate-700 to-slate-800',
        },
    ];

    // Admin metrics (unchanged)
    const adminMetrics = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <MetricCard
                title="Total Users"
                value={stats?.overview.totalUsers || 0}
                change="Active users"
                trend="neutral"
                icon={<Users className="w-7 h-7 text-white" />}
                color="bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"
                loading={loading}
                href="/users"
            />

            <MetricCard
                title="Total Incidents"
                value={stats?.overview.totalIncidents || 0}
                change={
                    stats?.recent.recentIncidents
                        ? `+${stats.recent.recentIncidents} this month`
                        : '0 this month'
                }
                trend={stats?.recent.recentIncidents ? 'up' : 'neutral'}
                icon={<AlertTriangle className="w-7 h-7 text-white" />}
                color="bg-gradient-to-br from-red-500 via-red-600 to-orange-600"
                loading={loading}
            />

            <MetricCard
                title="Health Assessments"
                value={stats?.overview.totalQuestionnaires || 0}
                change={
                    stats?.recent.recentSubmissions
                        ? `+${stats.recent.recentSubmissions} this month`
                        : '0 this month'
                }
                trend={stats?.recent.recentSubmissions ? 'up' : 'neutral'}
                icon={<Heart className="w-7 h-7 text-white" />}
                color="bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600"
                loading={loading}
            />

            <MetricCard
                title="Mental Health Screenings"
                value={stats?.overview.totalUnahonAssessments || 0}
                change={
                    stats?.recent.recentUnahonAssessments
                        ? `+${stats.recent.recentUnahonAssessments} this month`
                        : '0 this month'
                }
                trend={stats?.recent.recentUnahonAssessments ? 'up' : 'neutral'}
                icon={<ShieldCheck className="w-7 h-7 text-white" />}
                color="bg-gradient-to-br from-purple-500 via-purple-600 to-violet-600"
                loading={loading}
                href="/unahon/manage"
            />
        </div>
    );

    const activitiesToShow =
        (isPersonalDashboard ? myRecentActivities : stats?.recentActivities) ||
        [];

    // ✅ metrics grid cols: Standard=3, Responder=4, Admin handled separately
    const metricsGridCols = isStandard ? 'lg:grid-cols-3' : 'lg:grid-cols-4';

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#fff4f4] via-[#ffeaea] to-[#fff7f7]">
            <div className="absolute inset-0 opacity-35">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-200/20 via-transparent to-red-200/20" />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(127, 29, 29, 0.12) 1px, transparent 0)`,
                        backgroundSize: '22px 22px',
                    }}
                />
            </div>

            <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
                {/* Header */}
                <Card className="mb-8 bg-white shadow-xl border border-slate-200 overflow-hidden">
                    <CardBody className="p-8 relative">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
                            <div className="flex-1">
                                <div className="flex items-center gap-5 mb-2">
                                    <div className="relative">
                                        <Image
                                            src={session?.user?.image || '/placeholder.svg'}
                                            alt={session?.user?.name || 'User avatar'}
                                            width={64}
                                            height={64}
                                            className="rounded-full object-cover border-4 border-rose-100 shadow-md"
                                        />
                                        <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                                    </div>

                                    <div className="flex flex-col">
                                        <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                                            {getGreeting()}, {session?.user?.name || 'User'}!
                                        </h1>

                                        <p className="text-slate-600 text-base mt-2">
                                            Welcome to your DRRM Command Center
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4">
                                <Button
                                    className="font-bold bg-gradient-to-r from-[#7A0C1E] to-[#B91C1C] hover:from-[#6B0F25] hover:to-[#991B1B] text-white min-w-[200px] h-14 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105"
                                    size="lg"
                                    startContent={<Lightbulb className="w-5 h-5" />}
                                    onPress={onOpen}
                                >
                                    Quick Actions
                                </Button>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Metrics */}
                {isAdmin ? (
                    adminMetrics
                ) : (
                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${metricsGridCols} gap-6 mb-8`}>
                        {(isResponder ? responderMetrics : standardMetrics).map((m, idx) => (
                            <MetricCard
                                key={idx}
                                title={m.title}
                                value={m.value}
                                change={m.change}
                                trend={m.trend}
                                icon={m.icon}
                                color={m.color}
                                loading={loading}
                            />
                        ))}
                    </div>
                )}

                {/* ✅ Standard: remove Overview/Tabs completely */}
                {!isStandard && (
                    <Tabs
                        selectedKey={selectedTab}
                        onSelectionChange={(key) => setSelectedTab(key as string)}
                        className="mb-8"
                        classNames={{
                            tabList:
                                'bg-white/80 backdrop-blur-xl shadow-xl border border-white/30 p-2',
                            tab: 'font-semibold text-slate-700 data-[selected=true]:text-white',
                            tabContent:
                                'group-data-[selected=true]:text-white group-data-[hover=true]:text-slate-900',
                            cursor:
                                'bg-gradient-to-r from-[#7A0C1E] to-[#B91C1C] shadow-lg',
                            panel: 'pt-4',
                        }}
                    >
                        <Tab
                            key="overview"
                            title={
                                <div className="flex items-center gap-2 px-2">
                                    <BarChart3 className="w-5 h-5" />
                                    <span className="hidden sm:inline">Overview</span>
                                </div>
                            }
                        >
                            <div className="space-y-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-6">
                                        <h2 className="text-3xl font-black text-slate-900">
                                            DRRM Tools Status
                                        </h2>
                                        <div className="flex-1 h-px bg-gradient-to-r from-rose-300 to-transparent" />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {tools.map((tool, index) => (
                                            <ToolCard key={index} {...tool} loading={loading} />
                                        ))}
                                    </div>
                                </div>

                                <Card className="bg-white/80 backdrop-blur-xl shadow-2xl border border-white/30">
                                    <CardHeader className="pb-4">
                                        <div className="flex items-center gap-3 w-full">
                                            <h3 className="text-2xl font-black text-slate-900">
                                                {isPersonalDashboard
                                                    ? 'My Recent Activities'
                                                    : 'Recent Activities'}
                                            </h3>
                                            <div className="flex-1 h-px bg-gradient-to-r from-rose-200 to-transparent" />
                                        </div>
                                    </CardHeader>

                                    <CardBody>
                                        <div className="space-y-3">
                                            {activitiesToShow.length ? (
                                                activitiesToShow.slice(0, 5).map((activity, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-4 p-4 bg-white/70 rounded-xl border border-rose-100 hover:border-rose-200 hover:shadow-md transition-all"
                                                    >
                                                        <div className="p-3 bg-gradient-to-br from-rose-100 to-red-100 rounded-xl">
                                                            <Clock className="w-5 h-5 text-rose-700" />
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-slate-900 truncate">
                                                                {activity.action}
                                                            </p>
                                                            <p className="text-sm text-slate-600 truncate">
                                                                {activity.tool} • {activity.user}
                                                            </p>
                                                        </div>

                                                        <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                                            {formatTimeAgo(activity.timestamp)}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-8 text-slate-500">
                                                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                                    <p>No recent activities</p>
                                                </div>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            </div>
                        </Tab>

                        {isAdmin && (
                            <Tab
                                key="analytics"
                                title={
                                    <div className="flex items-center gap-2 px-2">
                                        <PieChart className="w-5 h-5" />
                                        <span className="hidden sm:inline">Analytics</span>
                                    </div>
                                }
                            >
                                <Card className="bg-white/75 backdrop-blur-xl shadow-xl border border-white/30">
                                    <CardBody className="p-4 sm:p-6">
                                        <DashboardCharts chartsData={chartsData} />
                                    </CardBody>
                                </Card>
                            </Tab>
                        )}
                    </Tabs>
                )}

                {/* ✅ Standard: still show My Recent Activities (below metrics) */}
                {isStandard && (
                    <Card className="bg-white/80 backdrop-blur-xl shadow-2xl border border-white/30">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3 w-full">
                                <h3 className="text-2xl font-black text-slate-900">
                                    My Recent Activities
                                </h3>
                                <div className="flex-1 h-px bg-gradient-to-r from-rose-200 to-transparent" />
                            </div>
                        </CardHeader>

                        <CardBody>
                            <div className="space-y-3">
                                {activitiesToShow.length ? (
                                    activitiesToShow.slice(0, 5).map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-4 p-4 bg-white/70 rounded-xl border border-rose-100 hover:border-rose-200 hover:shadow-md transition-all"
                                        >
                                            <div className="p-3 bg-gradient-to-br from-rose-100 to-red-100 rounded-xl">
                                                <Clock className="w-5 h-5 text-rose-700" />
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 truncate">
                                                    {activity.action}
                                                </p>
                                                <p className="text-sm text-slate-600 truncate">
                                                    {activity.tool} • {activity.user}
                                                </p>
                                            </div>

                                            <div className="text-sm text-slate-500 font-medium whitespace-nowrap">
                                                {formatTimeAgo(activity.timestamp)}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-slate-500">
                                        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p>No recent activities</p>
                                    </div>
                                )}
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* Quick Actions Modal */}
                <Modal
                    isOpen={isOpen}
                    onOpenChange={onOpenChange}
                    size="3xl"
                    classNames={{
                        backdrop:
                            'bg-gradient-to-t from-black/50 to-black/10 backdrop-opacity-20',
                        base: 'border-0 bg-white/95 backdrop-blur-xl shadow-2xl',
                        header: 'border-b border-rose-100',
                        body: 'py-6',
                    }}
                >
                    <ModalContent>
                        <ModalHeader>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-rose-100 to-red-100 rounded-xl">
                                    <Lightbulb className="w-6 h-6 text-rose-700" />
                                </div>
                                <h2 className="text-2xl font-black">Quick Actions</h2>
                            </div>
                        </ModalHeader>
                        <ModalBody>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => (
                                    <Button
                                        key={index}
                                        className={`${action.color} font-bold h-20 text-left transition-all duration-300 transform hover:scale-[1.02]`}
                                        onPress={() => {
                                            router.push(action.href);
                                            onOpenChange();
                                        }}
                                        startContent={
                                            <div className="p-2 bg-white/20 rounded-lg">
                                                {action.icon}
                                            </div>
                                        }
                                    >
                                        <div className="flex flex-col items-start">
                                            <div className="font-bold text-lg">
                                                {action.title}
                                            </div>
                                            <div className="text-sm opacity-90 font-normal">
                                                {action.description}
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </ModalBody>
                    </ModalContent>
                </Modal>
            </div>
        </div>
    );
};

export default Dashboard;