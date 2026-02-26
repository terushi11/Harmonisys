'use client';

import type React from 'react';

import { Card, CardBody, CardHeader, Progress, Chip } from '@heroui/react';
import {
    TrendingUp,
    MapPin,
    Users,
    Clock,
    Flame,
    ShieldCheck,
    AlertTriangle,
} from 'lucide-react';
import type { DashboardChartsData } from '@/types';

interface DashboardChartsProps {
    chartsData: DashboardChartsData | null;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ chartsData }) => {
    if (!chartsData) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                    <Card
                        key={i}
                        className="bg-white/80 backdrop-blur-xl shadow-2xl border-0"
                    >
                        <CardBody className="p-8">
                            <div className="animate-pulse">
                                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                                <div className="h-64 bg-gray-200 rounded"></div>
                            </div>
                        </CardBody>
                    </Card>
                ))}
            </div>
        );
    }

    const COLORS = [
        '#3B82F6', // Blue
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Violet
        '#06B6D4', // Cyan
        '#F97316', // Orange
        '#84CC16', // Lime
    ];

    const maxCategoryValue = Math.max(
        ...chartsData.distributions.category.map((c) => c.value)
    );
    const maxLocationValue = Math.max(
        ...chartsData.topLocations.map((l) => l.value)
    );

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
                <h2 className="text-3xl font-black text-gray-900">
                    Analytics Dashboard
                </h2>
                <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent" />
                <Chip color="primary" variant="flat" size="sm">
                    Real-time
                </Chip>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Monthly Trends */}
                {/* <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 col-span-1 lg:col-span-2"> */}
                {/* <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Monthly Activity Trends
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Track system usage over time
                                </p>
                            </div>
                        </div>
                    </CardHeader> */}
                {/* <CardBody>
                        <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-200">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📊</div>
                                <h4 className="text-xl font-bold text-gray-700 mb-2">
                                    Interactive Charts Coming Soon
                                </h4>
                                <p className="text-gray-600 mb-4">
                                    Advanced visualization with real-time data
                                </p>
                                <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                        <span>
                                            Data Points:{' '}
                                            {
                                                chartsData.monthlyTrends.labels
                                                    .length
                                            }
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <span>Active Monitoring</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardBody> */}
                {/* </Card> */}

                {/* Incident Categories */}
                <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-red-100 to-orange-100 rounded-xl">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Incident Categories
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Distribution by type
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            {chartsData.distributions.category.map(
                                (item, index) => (
                                    <div key={item.name} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-4 h-4 rounded-full shadow-lg"
                                                    style={{
                                                        backgroundColor:
                                                            COLORS[
                                                                index %
                                                                    COLORS.length
                                                            ],
                                                    }}
                                                />
                                                <span className="font-semibold text-gray-700">
                                                    {item.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-bold text-gray-900 text-lg">
                                                    {item.value}
                                                </span>
                                                <Chip
                                                    size="sm"
                                                    variant="flat"
                                                    color={
                                                        index === 0
                                                            ? 'danger'
                                                            : index === 1
                                                              ? 'warning'
                                                              : 'default'
                                                    }
                                                >
                                                    {Math.round(
                                                        (item.value /
                                                            maxCategoryValue) *
                                                            100
                                                    )}
                                                    %
                                                </Chip>
                                            </div>
                                        </div>
                                        <Progress
                                            value={
                                                (item.value /
                                                    maxCategoryValue) *
                                                100
                                            }
                                            className="max-w-full"
                                            color={
                                                index === 0
                                                    ? 'danger'
                                                    : index === 1
                                                      ? 'warning'
                                                      : 'primary'
                                            }
                                            size="md"
                                            aria-labelledby="progress"
                                            aria-valuenow={
                                                (item.value /
                                                    maxCategoryValue) *
                                                100
                                            }
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        />
                                    </div>
                                )
                            )}
                        </div>
                    </CardBody>
                </Card>

                {/* Top Responders */}
                <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Top Responders
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Most active team members
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="space-y-4">
                            {chartsData.recentActivity
                                .filter(
                                    (activity) => activity.type === 'assessment'
                                )
                                .slice(0, 5)
                                .map((activity, index) => (
                                    <div
                                        key={activity.id}
                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <span className="text-white font-bold text-sm">
                                                        #{index + 1}
                                                    </span>
                                                </div>
                                                {index < 3 && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                                        <span className="text-xs">
                                                            🏆
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">
                                                    {activity.description.split(
                                                        'by '
                                                    )[1] || 'Unknown'}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    {activity.title}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Chip
                                                size="sm"
                                                variant="flat"
                                                color="secondary"
                                            >
                                                {new Date(
                                                    activity.timestamp
                                                ).toLocaleDateString()}
                                            </Chip>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardBody>
                </Card>

                {/* Top Locations */}
                <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-0 col-span-1 lg:col-span-2">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl">
                                <MapPin className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">
                                    Top Incident Locations
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Areas requiring attention
                                </p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {chartsData.topLocations
                                .slice(0, 8)
                                .map((location, index) => (
                                    <div
                                        key={location.name}
                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100 hover:border-green-200 hover:shadow-lg transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                                    <span className="text-white font-bold text-sm">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                                {index < 3 && (
                                                    <div className="absolute -top-1 -right-1">
                                                        <Flame className="w-4 h-4 text-red-500" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="font-bold text-gray-900 truncate">
                                                    {location.name}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Progress
                                                        value={
                                                            (location.value /
                                                                maxLocationValue) *
                                                            100
                                                        }
                                                        className="flex-1"
                                                        color="success"
                                                        size="sm"
                                                        aria-labelledby="progress"
                                                        aria-valuenow={
                                                            (location.value /
                                                                maxLocationValue) *
                                                            100
                                                        }
                                                        aria-valuemin={0}
                                                        aria-valuemax={100}
                                                    />
                                                    <span className="text-sm font-bold text-gray-700 whitespace-nowrap">
                                                        {location.value}{' '}
                                                        incidents
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default DashboardCharts;
