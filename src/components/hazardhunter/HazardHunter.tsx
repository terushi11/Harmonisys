'use client';

import { useState } from 'react';
import {
    Card,
    CardBody,
    CardHeader,
    Input,
    Button,
    Chip,
    Skeleton,
} from '@heroui/react';
import {
    Search,
    MapPin,
    AlertTriangle,
    Globe,
    Clock,
    ArrowLeft,
    Info,
} from 'lucide-react';
import Link from 'next/link';

interface NominatimResult {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    boundingbox: string[];
    lat: string;
    lon: string;
    display_name: string;
    class: string;
    type: string;
    importance: number;
}

interface HazardData {
    activeFault: {
        assessment: string;
        explanation: string;
        distance: string;
        units: string;
        direction: string;
        fault_name: string;
    };
    groundRupture: {
        assessment: string;
        explanation: string;
        distance: string;
        units: string;
        direction: string;
    };
    groundShaking: {
        assessment: string;
        explanation: string[];
    };
    eil: {
        assessment: string;
        explanation: string[];
    };
    liquefaction: {
        assessment: string;
        explanation: string[];
    };
    tsunami: {
        assessment: string;
        explanation: string[];
        result: string;
    };
    flood: {
        assessment: string;
        explanation: string[];
        result: string;
    };
    ril: {
        assessment: string;
        explanation: string[];
        result: string;
    };
    stormSurge: {
        assessment: string;
        explanation: string[];
        result: string;
    };
    ashfall: {
        assessment: string;
        explanation: string[];
    };
    coordinates: {
        latitude: string;
        longitude: string;
    };
    location: {
        name: string;
    };
}

interface ApiResponse {
    message: string;
    data: {
        success: boolean;
        message: string;
        data: HazardData;
    };
}

const HazardHunter = () => {
    const [placeInput, setPlaceInput] = useState('');
    const [nominatimResults, setNominatimResults] = useState<NominatimResult[]>(
        []
    );
    const [selectedCoordinates, setSelectedCoordinates] = useState<{
        lat: number;
        lng: number;
    } | null>(null);
    const [hazardData, setHazardData] = useState<HazardData | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchingPlace, setSearchingPlace] = useState(false);

    const searchPlace = async () => {
        if (!placeInput.trim()) return;

        setSearchingPlace(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeInput)}&limit=10&countrycodes=ph`
            );
            const results: NominatimResult[] = await response.json();
            setNominatimResults(results);
        } catch (error) {
            console.error('Error searching place:', error);
        } finally {
            setSearchingPlace(false);
        }
    };

    const selectPlace = (result: NominatimResult) => {
        const lat = Number.parseFloat(result.lat);
        const lng = Number.parseFloat(result.lon);
        setSelectedCoordinates({ lat, lng });
        //setNominatimResults([]);
        setPlaceInput(result.display_name);
    };

    const assessHazard = async () => {
        if (!selectedCoordinates) {
            alert('Please search and select a place first');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/hazardhunter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    latitude: selectedCoordinates.lat,
                    longitude: selectedCoordinates.lng,
                }),
            });

            const result: ApiResponse = await response.json();

            if (result.data && result.data.success) {
                setHazardData(result.data.data);
            } else {
                alert('Failed to fetch hazard assessment data');
            }
        } catch (error) {
            console.error('Error assessing hazard:', error);
            alert('Error occurred while fetching hazard assessment');
        } finally {
            setLoading(false);
        }
    };

    const getAssessmentColor = (assessment: string) => {
        if (assessment.toLowerCase().includes('safe')) return 'success';
        if (assessment.toLowerCase().includes('prone')) return 'danger';
        if (assessment.toLowerCase().includes('outside')) return 'default';
        return 'warning';
    };

    const getHazardIcon = (hazardType: string) => {
        const iconClass = 'w-6 h-6';
        switch (hazardType.toLowerCase()) {
            case 'fault':
            case 'rupture':
            case 'shaking':
                return (
                    <AlertTriangle className={`${iconClass} text-red-600`} />
                );
            case 'landslide':
                return <div className={`${iconClass} text-amber-600`}>🏔️</div>;
            case 'liquefaction':
                return <div className={`${iconClass} text-blue-600`}>💧</div>;
            case 'tsunami':
                return <div className={`${iconClass} text-blue-800`}>🌊</div>;
            case 'flood':
                return <div className={`${iconClass} text-blue-500`}>🌊</div>;
            case 'storm':
                return <div className={`${iconClass} text-purple-600`}>⛈️</div>;
            case 'ashfall':
                return <div className={`${iconClass} text-gray-600`}>🌋</div>;
            default:
                return (
                    <AlertTriangle className={`${iconClass} text-orange-600`} />
                );
        }
    };

    const reset = () => {
        setPlaceInput('');
        setNominatimResults([]);
        setSelectedCoordinates(null);
        setHazardData(null);
    };

    const getTotalHazards = () => {
        if (!hazardData) return 0;
        const hazards = [
            hazardData.activeFault,
            hazardData.groundRupture,
            hazardData.groundShaking,
            hazardData.eil,
            hazardData.liquefaction,
            hazardData.tsunami,
            hazardData.flood,
            hazardData.ril,
            hazardData.stormSurge,
            hazardData.ashfall,
        ];
        return hazards.length;
    };

    const getHighRiskCount = () => {
        if (!hazardData) return 0;
        const hazards = [
            hazardData.activeFault.assessment,
            hazardData.groundRupture.assessment,
            hazardData.groundShaking.assessment,
            hazardData.eil.assessment,
            hazardData.liquefaction.assessment,
            hazardData.tsunami.assessment,
            hazardData.flood.assessment,
            hazardData.ril.assessment,
            hazardData.stormSurge.assessment,
            hazardData.ashfall.assessment,
        ];
        return hazards.filter(
            (assessment) =>
                assessment.toLowerCase().includes('prone') ||
                assessment.toLowerCase().includes('high')
        ).length;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#f6f1e8] via-[#efe4d4] to-[#e8d7c2]">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* ✅ COMBINED HERO + SEARCH (ONE CARD) */}
                    <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-lg border border-white/20 overflow-hidden rounded-[28px]">

                    {/* HERO */}
                    <div className="bg-gradient-to-r from-[#5A3A1A] via-[#7B5A3A] to-[#9D7C5A]">
                        <div className="p-6">
                        <h1 className="text-4xl lg:text-5xl font-black text-white drop-shadow-[0_12px_22px_rgba(0,0,0,0.35)] mb-2">
                            HazardHunter Dashboard
                        </h1>
                        <p className="text-white/85 text-lg">
                            Comprehensive natural hazard risk assessment and safety analysis for any location
                        </p>
                        </div>
                    </div>

                    {/* SEARCH SECTION ATTACHED */}
                    <div className="border-t border-white/30">
                        <CardBody className="p-8">
                        <div className="space-y-4">

                            <div className="flex flex-col sm:flex-row gap-4">
                            <Input
                                placeholder="Enter location (e.g., Manila, Cebu, Davao...)"
                                value={placeInput}
                                onChange={(e) => setPlaceInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && searchPlace()}
                                className="flex-1"
                                classNames={{
                                input: 'bg-white/80 text-slate-700 placeholder:text-slate-500',
                                inputWrapper:
                                    'bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-sm border-2 border-[#d9c7b2] shadow-lg hover:shadow-xl hover:border-[#bfa58a] focus-within:border-[#9D7C5A] focus-within:shadow-xl transition-all duration-300 h-12',
                                }}
                                startContent={<MapPin className="h-5 w-5 text-[#7B5A3A]" />}
                            />

                            <Button
                                size="lg"
                                onPress={searchPlace}
                                isLoading={searchingPlace}
                                disabled={!placeInput.trim()}
                                className="min-w-[110px] bg-gradient-to-r from-[#5A3A1A] via-[#7B5A3A] to-[#9D7C5A] text-white shadow-lg hover:shadow-xl transition-all"
                                startContent={<Search className="w-5 h-5" />}
                            >
                                Search
                            </Button>

                            <Button
                                size="lg"
                                onPress={assessHazard}
                                isLoading={loading}
                                disabled={!selectedCoordinates}
                                className="min-w-[110px] bg-gradient-to-r from-[#5A3A1A] via-[#7B5A3A] to-[#9D7C5A] text-white shadow-lg hover:shadow-xl transition-all"
                            >
                                Assess
                            </Button>

                            <Button
                                variant="flat"
                                size="lg"
                                onPress={reset}
                                className="min-w-[110px] shadow-lg hover:shadow-xl transition-all"
                            >
                                Reset
                            </Button>
                            </div>

                            {/* Place Results */}
                            {nominatimResults.length > 0 && (
                            <div className="space-y-3">
                                <p className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                <Globe className="w-4 h-4 text-[#7B5A3A]" />
                                Select a location from the results:
                                </p>
                                <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 shadow-lg max-h-60 overflow-y-auto">
                                {nominatimResults.map((result) => (
                                    <div
                                    key={result.place_id}
                                    className="p-4 cursor-pointer hover:bg-[#f4ede3] transition-all duration-200 border-b border-slate-100/50 last:border-b-0"
                                    onClick={() => selectPlace(result)}
                                    >
                                    <p className="font-semibold text-sm text-slate-800">
                                        {result.display_name}
                                    </p>
                                    </div>
                                ))}
                                </div>
                            </div>
                            )}

                        </div>
                        </CardBody>
                    </div>
                    </Card>

                {/* Stats Section */}
                {loading ? (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-1 h-8 bg-gradient-to-b from-[#5a3a1a] to-[#a47445] rounded-full"></div>
                            Assessment Overview
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {Array.from({ length: 3 }).map((_, index) => (
                                <Card
                                    key={index}
                                    className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20"
                                >
                                    <CardBody className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <Skeleton className="w-14 h-14 rounded-xl">
                                                <div className="h-14"></div>
                                            </Skeleton>
                                            <div className="flex-1">
                                                <Skeleton className="w-40 h-6 rounded-lg mb-2">
                                                    <div className="h-6"></div>
                                                </Skeleton>
                                                <Skeleton className="w-32 h-4 rounded-lg">
                                                    <div className="h-4"></div>
                                                </Skeleton>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <Skeleton className="w-20 h-12 rounded-lg mb-2">
                                                <div className="h-12"></div>
                                            </Skeleton>
                                            <Skeleton className="w-24 h-6 rounded-lg">
                                                <div className="h-6"></div>
                                            </Skeleton>
                                        </div>
                                        <Skeleton className="w-full h-2 rounded-full">
                                            <div className="h-2"></div>
                                        </Skeleton>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : hazardData ? (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-1 h-8 bg-gradient-to-b from-[#5a3a1a] to-[#a47445] rounded-full"></div>
                            Assessment Overview
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Location Info */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-blue-100 rounded-xl">
                                            <Globe className="w-8 h-8 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800">
                                                Assessment Location
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Current target area
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <span className="text-sm font-bold text-slate-900 block truncate">
                                            {hazardData.location.name}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                            {hazardData.coordinates.latitude},{' '}
                                            {hazardData.coordinates.longitude}
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full w-full transition-all duration-500"></div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Total Hazards */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-orange-100 rounded-xl">
                                            <AlertTriangle className="w-8 h-8 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800">
                                                Total Hazards
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Assessed categories
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <span className="text-4xl font-bold text-slate-900">
                                            {getTotalHazards()}
                                        </span>
                                        <span className="text-lg text-slate-500 ml-2">
                                            hazards
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full w-full transition-all duration-500"></div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* High Risk Count */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2">
                                <CardBody className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-3 bg-red-100 rounded-xl">
                                            <Clock className="w-8 h-8 text-red-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-slate-800">
                                                High Risk Areas
                                            </h3>
                                            <p className="text-sm text-slate-500">
                                                Requires attention
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <span className="text-4xl font-bold text-slate-900">
                                            {getHighRiskCount()}
                                        </span>
                                        <span className="text-lg text-slate-500 ml-2">
                                            risks
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-200 rounded-full h-2">
                                        <div className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full w-full transition-all duration-500"></div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                ) : null}

                {/* Results Section */}
                {loading ? (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-1 h-8 bg-gradient-to-b from-[#5a3a1a] to-[#a47445] rounded-full"></div>
                            Hazard Assessment Results
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Array.from({ length: 9 }).map((_, index) => (
                                <Card
                                    key={index}
                                    className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20"
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="w-6 h-6 rounded">
                                                    <div className="h-6"></div>
                                                </Skeleton>
                                                <div>
                                                    <Skeleton className="w-32 h-5 rounded mb-1">
                                                        <div className="h-5"></div>
                                                    </Skeleton>
                                                    <Skeleton className="w-24 h-3 rounded">
                                                        <div className="h-3"></div>
                                                    </Skeleton>
                                                </div>
                                            </div>
                                            <Skeleton className="w-20 h-6 rounded-full">
                                                <div className="h-6"></div>
                                            </Skeleton>
                                        </div>
                                    </CardHeader>
                                    <CardBody className="pt-0">
                                        <div className="space-y-3 mt-4">
                                            <Card className="bg-slate-50/50">
                                                <CardBody className="p-3">
                                                    <Skeleton className="w-32 h-3 rounded mb-1">
                                                        <div className="h-3"></div>
                                                    </Skeleton>
                                                    <Skeleton className="w-24 h-4 rounded">
                                                        <div className="h-4"></div>
                                                    </Skeleton>
                                                </CardBody>
                                            </Card>
                                            <Skeleton className="w-full h-12 rounded-lg">
                                                <div className="h-12"></div>
                                            </Skeleton>
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                        </div>
                    </div>
                ) : hazardData ? (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <div className="w-1 h-8 bg-gradient-to-b from-[#5a3a1a] to-[#a47445] rounded-full"></div>
                            Hazard Assessment Results
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Active Fault */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-80">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3">
                                            {getHazardIcon('fault')}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Active Fault
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Seismic fault lines
                                                </p>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={getAssessmentColor(
                                                hazardData.activeFault
                                                    .assessment
                                            )}
                                            variant="flat"
                                            classNames={{
                                                content:
                                                    'max-w-[150px] truncate',
                                            }}
                                            title={
                                                hazardData.activeFault
                                                    .assessment
                                            }
                                        >
                                            {hazardData.activeFault.assessment}
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3 mt-4">
                                        <Card className="bg-slate-50/50 ">
                                            <CardBody className="p-3">
                                                <div className="text-xs font-medium text-slate-600 mb-1">
                                                    Distance & Direction:
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    {
                                                        hazardData.activeFault
                                                            .distance
                                                    }{' '}
                                                    {
                                                        hazardData.activeFault
                                                            .units
                                                    }{' '}
                                                    {
                                                        hazardData.activeFault
                                                            .direction
                                                    }
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <Card className="bg-slate-50/50">
                                            <CardBody className="p-3">
                                                <div className="text-xs font-medium text-slate-600 mb-1">
                                                    Fault Name:
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    {
                                                        hazardData.activeFault
                                                            .fault_name
                                                    }
                                                </div>
                                            </CardBody>
                                        </Card>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <div className="group relative">
                                            <span className="text-xs text-blue-700 font-medium cursor-help">
                                                More Information
                                            </span>
                                            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                                {
                                                    hazardData.activeFault
                                                        .explanation
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Ground Rupture */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-80">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3">
                                            {getHazardIcon('rupture')}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Ground Rupture
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Surface breaking
                                                </p>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={getAssessmentColor(
                                                hazardData.groundRupture
                                                    .assessment
                                            )}
                                            variant="flat"
                                            classNames={{
                                                content:
                                                    'max-w-[150px] truncate',
                                            }}
                                            title={
                                                hazardData.groundRupture
                                                    .assessment
                                            }
                                        >
                                            {
                                                hazardData.groundRupture
                                                    .assessment
                                            }
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3 mt-4">
                                        <Card className="bg-slate-50/50">
                                            <CardBody className="p-3">
                                                <div className="text-xs font-medium text-slate-600 mb-1">
                                                    Distance & Direction:
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    {
                                                        hazardData.groundRupture
                                                            .distance
                                                    }{' '}
                                                    {
                                                        hazardData.groundRupture
                                                            .units
                                                    }{' '}
                                                    {
                                                        hazardData.groundRupture
                                                            .direction
                                                    }
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <div className="group relative">
                                                <span className="text-xs text-blue-700 font-medium cursor-help">
                                                    More Information
                                                </span>
                                                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                                    {
                                                        hazardData.groundRupture
                                                            .explanation
                                                    }
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Ground Shaking */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-80">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3">
                                            {getHazardIcon('shaking')}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Ground Shaking
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Seismic intensity
                                                </p>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={getAssessmentColor(
                                                hazardData.groundShaking
                                                    .assessment
                                            )}
                                            variant="flat"
                                            classNames={{
                                                content:
                                                    'max-w-[150px] truncate',
                                            }}
                                            title={
                                                hazardData.groundShaking
                                                    .assessment
                                            }
                                        >
                                            {
                                                hazardData.groundShaking
                                                    .assessment
                                            }
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0 flex-1 flex flex-col justify-between">
                                    <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <div className="group relative">
                                            <span className="text-xs text-blue-700 font-medium cursor-help">
                                                More Information
                                            </span>
                                            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                                {
                                                    hazardData.groundShaking
                                                        .explanation[0]
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Earthquake-Induced Landslide */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-80">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3">
                                            {getHazardIcon('landslide')}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Earthquake Landslide
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Seismic slope failure
                                                </p>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={getAssessmentColor(
                                                hazardData.eil.assessment
                                            )}
                                            variant="flat"
                                            classNames={{
                                                content:
                                                    'max-w-[150px] truncate',
                                            }}
                                            title={hazardData.eil.assessment}
                                        >
                                            {hazardData.eil.assessment}
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0">
                                    <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <div className="group relative">
                                            <span className="text-xs text-blue-700 font-medium cursor-help">
                                                More Information
                                            </span>
                                            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                                {hazardData.eil.explanation[0]}
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Liquefaction */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-80">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3">
                                            {getHazardIcon('liquefaction')}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Liquefaction
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Soil liquefaction risk
                                                </p>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={getAssessmentColor(
                                                hazardData.liquefaction
                                                    .assessment
                                            )}
                                            variant="flat"
                                            classNames={{
                                                content:
                                                    'max-w-[150px] truncate',
                                            }}
                                            title={
                                                hazardData.liquefaction
                                                    .assessment
                                            }
                                        >
                                            {hazardData.liquefaction.assessment}
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0 flex-1 flex flex-col justify-between">
                                    <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <div className="group relative">
                                            <span className="text-xs text-blue-700 font-medium cursor-help">
                                                More Information
                                            </span>
                                            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                                {hazardData.liquefaction.explanation.join(
                                                    ' '
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Tsunami */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-80">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3">
                                            {getHazardIcon('tsunami')}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Tsunami
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Seismic sea waves
                                                </p>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={getAssessmentColor(
                                                hazardData.tsunami.assessment
                                            )}
                                            variant="flat"
                                            classNames={{
                                                content:
                                                    'max-w-[150px] truncate',
                                            }}
                                            title={
                                                hazardData.tsunami.assessment
                                            }
                                        >
                                            {hazardData.tsunami.assessment}
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3 mt-4">
                                        <Card className="bg-blue-50/50">
                                            <CardBody className="p-3">
                                                <div className="text-xs font-medium text-slate-600 mb-1">
                                                    Assessment Result:
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    {hazardData.tsunami.result}
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <div className="group relative">
                                                <span className="text-xs text-blue-700 font-medium cursor-help">
                                                    More Information
                                                </span>
                                                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                                    {hazardData.tsunami.explanation.join(
                                                        ' '
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Flood */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-80">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3">
                                            {getHazardIcon('flood')}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Flood Risk
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Water inundation
                                                </p>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={getAssessmentColor(
                                                hazardData.flood.assessment
                                            )}
                                            variant="flat"
                                            classNames={{
                                                content:
                                                    'max-w-[150px] truncate',
                                            }}
                                            title={hazardData.flood.assessment}
                                        >
                                            {hazardData.flood.assessment}
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3 mt-4">
                                        <Card className="bg-blue-50/50">
                                            <CardBody className="p-3">
                                                <div className="text-xs font-medium text-slate-600 mb-1">
                                                    Assessment Result:
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    {hazardData.flood.result}
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <div className="group relative">
                                                <span className="text-xs text-blue-700 font-medium cursor-help">
                                                    More Information
                                                </span>
                                                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                                    {hazardData.flood.explanation.join(
                                                        ' '
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Rain-Induced Landslide */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-80">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3">
                                            {getHazardIcon('landslide')}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Rain Landslide
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Rainfall-induced slides
                                                </p>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={getAssessmentColor(
                                                hazardData.ril.assessment
                                            )}
                                            variant="flat"
                                            classNames={{
                                                content:
                                                    'max-w-[150px] truncate',
                                            }}
                                            title={hazardData.ril.assessment}
                                        >
                                            {hazardData.ril.assessment}
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3 mt-4">
                                        <Card className="bg-purple-50/50">
                                            <CardBody className="p-3">
                                                <div className="text-xs font-medium text-slate-600 mb-1">
                                                    Assessment Result:
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    {hazardData.ril.result}
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <div className="group relative">
                                                <span className="text-xs text-blue-700 font-medium cursor-help">
                                                    More Information
                                                </span>
                                                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                                    {hazardData.ril.explanation.join(
                                                        ' '
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Storm Surge */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-80">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3">
                                            {getHazardIcon('storm')}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Storm Surge
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Coastal storm waves
                                                </p>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={getAssessmentColor(
                                                hazardData.stormSurge.assessment
                                            )}
                                            variant="flat"
                                            classNames={{
                                                content:
                                                    'max-w-[150px] truncate',
                                            }}
                                            title={
                                                hazardData.stormSurge.assessment
                                            }
                                        >
                                            {hazardData.stormSurge.assessment}
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0 flex-1 flex flex-col justify-between">
                                    <div className="space-y-3 mt-4">
                                        <Card className="bg-purple-50/50">
                                            <CardBody className="p-3">
                                                <div className="text-xs font-medium text-slate-600 mb-1">
                                                    Assessment Result:
                                                </div>
                                                <div className="text-sm font-bold text-slate-800">
                                                    {
                                                        hazardData.stormSurge
                                                            .result
                                                    }
                                                </div>
                                            </CardBody>
                                        </Card>
                                        <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                            <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                            <div className="group relative">
                                                <span className="text-xs text-blue-700 font-medium cursor-help">
                                                    More Information
                                                </span>
                                                <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                                    {hazardData.stormSurge.explanation.join(
                                                        ' '
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>

                            {/* Ashfall */}
                            <Card className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 h-80">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start w-full">
                                        <div className="flex items-center gap-3">
                                            {getHazardIcon('ashfall')}
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    Volcanic Ashfall
                                                </h3>
                                                <p className="text-xs text-slate-500">
                                                    Volcanic ash deposits
                                                </p>
                                            </div>
                                        </div>
                                        <Chip
                                            size="sm"
                                            color={getAssessmentColor(
                                                hazardData.ashfall.assessment
                                            )}
                                            variant="flat"
                                            classNames={{
                                                content:
                                                    'max-w-[150px] truncate',
                                            }}
                                            title={
                                                hazardData.ashfall.assessment
                                            }
                                        >
                                            {hazardData.ashfall.assessment}
                                        </Chip>
                                    </div>
                                </CardHeader>
                                <CardBody className="pt-0">
                                    <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                                        <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <div className="group relative">
                                            <span className="text-xs text-blue-700 font-medium cursor-help">
                                                More Information
                                            </span>
                                            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[9999] pointer-events-none">
                                                {
                                                    hazardData.ashfall
                                                        .explanation[0]
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </CardBody>
                            </Card>
                        </div>
                    </div>
                ) : null}

                {/* Empty State */}
                {!hazardData && !loading && (
                    <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20 max-w-md mx-auto">
                        <CardBody className="p-12 text-center">
                            <div className="text-6xl mb-6">🔍</div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                Ready for Assessment
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                Search for a location above and click
                                &quot;Assess&quot; to get comprehensive
                                natural disaster risk analysis for any area in
                                the Philippines.
                            </p>
                        </CardBody>
                    </Card>
                )}
            </div>
        </div>
    );
};

export default HazardHunter;
