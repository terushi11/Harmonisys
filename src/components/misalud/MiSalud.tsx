'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardBody, CardHeader, Button } from '@heroui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import type {
    Team,
    Event,
    QuestionnaireResponses,
    QuestionnaireFormData,
} from '@/types';
import { Incident } from '@/types';
import { parseIncidentDates } from '@/lib/action/irs';

import Questionnaire from './Questionnaire';
import MiSaludControls from './MiSaludControls';
import MiSaludStats from './MiSaludStats';
import MiSaludGrid from './MiSaludGrid';
import type { Recommendation } from '@/types';
import { generateRecommendations } from '@/lib/action/misalud';
import RecommendationsModal from './RecommendationsModal';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface QuestionnaireResponse {
    id: string;
    questionId: number;
    questionText: string;
    selectedOption: string;
    submissionId: string;
}

export interface QuestionnaireSubmission {
    id: string;
    name: string;
    date: string;
    team: string;
    createdAt: string;
    updatedAt: string;
    responses: QuestionnaireResponse[];
}

export interface QuestionnaireData {
    submissions: QuestionnaireSubmission[];
}

export interface TeamGroup {
    teamName: string;
    members: QuestionnaireSubmission[];
    totalSubmissions: number;
    lastSubmission: string;
}

export interface IncidentGroup {
    teamDeployed: string;
    incidents: Incident[];
    totalIncidents: number;
    lastIncident: Date;
    severityBreakdown: { [key: string]: number };
}

type MiSaludProps = {
  userRole?: 'ADMIN' | 'RESPONDER' | 'STANDARD' | string;
};

const MiSalud = ({ userRole = 'STANDARD' }: MiSaludProps) => {
      const roleRaw = String(userRole || 'STANDARD').toUpperCase();
  const isResponderView = roleRaw.includes('RESPONDER'); // true for RESPONDER users


    const router = useRouter();
    useEffect(() => {
  const canAccess = userRole === 'ADMIN' || userRole === 'RESPONDER';
  if (!canAccess) {
    router.replace('/overview/misalud');
  }
}, [userRole, router]);

    const searchParams = useSearchParams();
    const [selectedView, setSelectedView] = useState<'teams' | 'events'>(() => {
        const viewParam = searchParams.get('view');
        return viewParam === 'events' ? 'events' : 'teams';
    });
    const [selectedFilter, setSelectedFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState<string>('');

    // Original data (for archive)
    const [teamsData, setTeamsData] = useState<Team[]>([]);
    const [eventsData, setEventsData] = useState<Event[]>([]);
    const [loadingOriginal, setLoadingOriginal] = useState(true);

    // New questionnaire data (main display)
    const [questionnaireData, setQuestionnaireData] =
        useState<QuestionnaireData>({ submissions: [] });
    const [loadingQuestionnaire, setLoadingQuestionnaire] = useState(true);

    // New incidents data (for events view) - converted to frontend type
    const [incidentsData, setIncidentsData] = useState<Incident[]>([]);
    const [loadingIncidents, setLoadingIncidents] = useState(true);

    const [showQuestionnaireModal, setShowQuestionnaireModal] = useState(false);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [recommendations, setRecommendations] = useState<Recommendation[]>(
        []
    );
    const [formData, setFormData] = useState<QuestionnaireFormData>({
        name: '',
        date: new Date(),
        team: '',
    });

    const handleRecommendations = (
        responses: QuestionnaireResponses,
        formData: QuestionnaireFormData
    ) => {
        setRecommendations(generateRecommendations(responses));
        setFormData(formData);
    };

    // Fetch original teams data
    const fetchTeamsData = async () => {
        try {
            const response = await fetch('/api/misalud/teams');
            if (!response.ok) {
                throw new Error('Failed to fetch teams data');
            }
            const data = await response.json();

            if (data.data) {
                setTeamsData(data.data);
            } else {
                console.error('No teams data found');
            }
        } catch (error) {
            console.error('Error fetching teams data:', error);
        }
    };

    // Fetch original events data
    const fetchEventsData = async () => {
        try {
            const response = await fetch('/api/misalud/screenings');
            if (!response.ok) {
                throw new Error('Failed to fetch events data');
            }
            const data = await response.json();

            if (data.data) {
                setEventsData(data.data);
            } else {
                console.error('No events data found');
            }
        } catch (error) {
            console.error('Error fetching events data:', error);
        } finally {
            setLoadingOriginal(false);
        }
    };

    // Fetch new questionnaire data
    const fetchQuestionnaireData = async () => {
        try {
            const response = await fetch('/api/misalud/health');
            if (!response.ok) {
                throw new Error('Failed to fetch questionnaire data');
            }
            const data = await response.json();
            setQuestionnaireData(data);
        } catch (error) {
            console.error('Error fetching questionnaire data:', error);
        } finally {
            setLoadingQuestionnaire(false);
        }
    };

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
            setLoadingIncidents(false);
        }
    };

    useEffect(() => {
        fetchTeamsData();
        fetchEventsData();
        fetchQuestionnaireData();
        fetchIncidentsData();
    }, []);

    // Group questionnaire submissions by team
    const teamGroups = useMemo(() => {
        const groups: { [key: string]: QuestionnaireSubmission[] } = {};

        questionnaireData.submissions.forEach((submission) => {
            if (!groups[submission.team]) {
                groups[submission.team] = [];
            }
            groups[submission.team].push(submission);
        });

        return Object.entries(groups).map(([teamName, members]) => ({
            teamName,
            members,
            totalSubmissions: members.length,
            lastSubmission: members.reduce(
                (latest, member) =>
                    new Date(member.createdAt) > new Date(latest)
                        ? member.createdAt
                        : latest,
                members[0]?.createdAt || ''
            ),
        }));
    }, [questionnaireData.submissions]);

    // Group incidents by teamDeployed
    const incidentGroups = useMemo(() => {
        const groups: { [key: string]: Incident[] } = {};

        incidentsData.forEach((incident) => {
            const team = incident.teamDeployed || 'Unassigned';
            if (!groups[team]) {
                groups[team] = [];
            }
            groups[team].push(incident);
        });

        return Object.entries(groups).map(([teamDeployed, incidents]) => {
            const severityBreakdown = incidents.reduce(
                (acc, incident) => {
                    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
                    return acc;
                },
                {} as { [key: string]: number }
            );

            return {
                teamDeployed,
                incidents,
                totalIncidents: incidents.length,
                lastIncident: incidents.reduce(
                    (latest, incident) =>
                        new Date(incident.createdAt) > new Date(latest)
                            ? incident.createdAt
                            : latest,
                    incidents[0]?.createdAt || ''
                ),
                severityBreakdown,
            };
        });
    }, [incidentsData]);

    // Handle team click
    const handleTeamClick = (teamName: string) => {
        // Navigate to team detail page
        router.push(`/misalud/team/${encodeURIComponent(teamName)}`);
    };

    // Handle event click - NEW FUNCTION
    const handleEventClick = (teamDeployed: string) => {
        // Navigate to event detail page
        router.push(`/irs/event/${encodeURIComponent(teamDeployed)}`);
    };

    // Filter teams based on archive vs new data
    const filteredTeams = useMemo(() => {
        if (selectedFilter === 'archive') {
            // Show original teams data in archive
            let filtered = teamsData;

            if (searchQuery) {
                filtered = filtered.filter(
                    (team) =>
                        team.name
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                        team.code
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                );
            }

            return filtered;
        } else {
            // Show new questionnaire team groups for other filters
            let filtered = teamGroups;

            if (searchQuery) {
                filtered = filtered.filter(
                    (team) =>
                        team.teamName
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                        team.members.some((member) =>
                            member.name
                                .toLowerCase()
                                .includes(searchQuery.toLowerCase())
                        )
                );
            }

            return filtered;
        }
    }, [teamsData, teamGroups, selectedFilter, searchQuery]);

    // Filter events based on archive vs new data
    const filteredEvents = useMemo(() => {
        if (selectedFilter === 'archive') {
            // Show original events data in archive
            let filtered = eventsData;

            if (searchQuery) {
                filtered = filtered.filter(
                    (event) =>
                        event.teamId
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                        event.id
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase())
                );
            }

            return filtered;
        } else {
            // Show new incidents data for other filters
            let filtered = incidentGroups;

            if (searchQuery) {
                filtered = filtered.filter(
                    (group) =>
                        group.teamDeployed
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) ||
                        group.incidents.some(
                            (incident) =>
                                incident.summary
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()) ||
                                incident.location
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase()) ||
                                incident.category
                                    .toLowerCase()
                                    .includes(searchQuery.toLowerCase())
                        )
                );
            }

            // Apply severity filters
            if (selectedFilter === 'high-severity') {
                filtered = filtered.filter((group) =>
                    group.incidents.some(
                        (incident) => incident.severity.toLowerCase() === 'high'
                    )
                );
            } else if (selectedFilter === 'critical-severity') {
                filtered = filtered.filter((group) =>
                    group.incidents.some(
                        (incident) =>
                            incident.severity.toLowerCase() === 'critical'
                    )
                );
            }

            return filtered;
        }
    }, [eventsData, incidentGroups, selectedFilter, searchQuery]);

    const getTeamByEventId = (teamId: string) => {
        return teamsData.find((team) => team.id === teamId);
    };

    const isArchiveView = selectedFilter === 'archive';
    const isLoading = isArchiveView
        ? loadingOriginal
        : selectedView === 'teams'
          ? loadingQuestionnaire
          : loadingIncidents;

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                
                {/* ✅ COMBINED HEADER + CONTROLS (like User Controller / REDAS) */}
                <Card className="mb-8 bg-white/70 backdrop-blur-sm shadow-lg border border-white/20 overflow-hidden rounded-[28px]">
                {/* ✅ HERO (top) */}
                <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-emerald-600">
                    <div className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                        <h1 className="text-4xl lg:text-5xl font-black text-white drop-shadow-[0_12px_22px_rgba(0,0,0,0.35)] mb-2">
                            MiSalud Dashboard
                        </h1>
                        <p className="text-white/85 text-lg">
                            {isArchiveView
                            ? 'Explore archived teams and events data with comprehensive historical insights'
                            : 'Monitor team wellness through questionnaire submissions and health analytics'}
                        </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
                        {!isResponderView && (
                            <Button
                            as={Link}
                            href="/overview/misalud"
                            variant="light"
                            startContent={<ArrowLeft className="w-4 h-4" />}
                            className="
                                h-12 px-6
                                bg-white/15 text-white
                                border border-white/25
                                backdrop-blur-sm
                                shadow-sm hover:shadow-md
                                hover:bg-white/20
                                transition-all duration-300
                                font-medium
                                rounded-xl
                            "
                            >
                            Go Back
                            </Button>
                        )}

                        <Button
                            className="font-bold bg-emerald-600 hover:bg-emerald-700 text-white min-w-[180px] h-12 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105 rounded-xl"
                            size="lg"
                            onPress={() => setShowQuestionnaireModal(true)}
                            endContent={
                            <svg
                                className="w-5 h-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                />
                            </svg>
                            }
                        >
                            Assess Health
                        </Button>
                        </div>
                    </div>
                    </div>
                </div>

                {/* ✅ CONTROLS (bottom attached) */}
                <div className="border-t border-white/30">
                <MiSaludControls
                    searchQuery={searchQuery}
                    selectedFilter={selectedFilter}
                    selectedView={selectedView}
                    setSearchQuery={setSearchQuery}
                    setSelectedFilter={setSelectedFilter}
                    setSelectedView={setSelectedView}
                />
                </div>
                </Card>
                {/* Stats Section */}
                <MiSaludStats
                    eventsData={eventsData}
                    filteredEvents={filteredEvents}
                    filteredTeams={filteredTeams}
                    incidentsData={incidentsData}
                    isArchiveView={isArchiveView}
                    questionnaireData={questionnaireData}
                    selectedView={selectedView}
                    teamGroups={teamGroups}
                    teamsData={teamsData}
                    loading={isLoading}
                />
                {/* Data Grid Section */}
                <MiSaludGrid
                    filteredEvents={filteredEvents}
                    filteredTeams={filteredTeams}
                    getTeamByEventId={getTeamByEventId}
                    handleEventClick={handleEventClick}
                    handleTeamClick={handleTeamClick}
                    isArchiveView={isArchiveView}
                    isLoading={isLoading}
                    selectedView={selectedView}
                />
                {/* Questionnaire Modal */}
                {showQuestionnaireModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <Card className="bg-white shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                            <CardHeader className="pb-4 border-b border-slate-200">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl shadow-lg">
                                            <svg
                                                className="w-6 h-6 text-white"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-teal-700 bg-clip-text text-transparent">
                                                Health Assessment
                                            </h2>
                                            <p className="text-slate-600 text-sm">
                                                Complete your wellness
                                                evaluation
                                            </p>
                                        </div>
                                    </div>

                                    <Button
                                        isIconOnly
                                        variant="light"
                                        onPress={() =>
                                            setShowQuestionnaireModal(false)
                                        }
                                        className="hover:bg-red-100"
                                    >
                                        <svg
                                            className="w-6 h-6 text-slate-400 hover:text-red-500"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M6 18L18 6M6 6l12 12"
                                            />
                                        </svg>
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardBody className="p-6">
                                <Questionnaire
                                    onClose={() =>
                                        setShowQuestionnaireModal(false)
                                    }
                                    openSuccessModal={() =>
                                        setShowSuccessDialog(true)
                                    }
                                    handleRecommendations={
                                        handleRecommendations
                                    }
                                />
                            </CardBody>
                        </Card>
                    </div>
                )}

                <RecommendationsModal
                    open={showSuccessDialog}
                    onClose={() => setShowSuccessDialog(false)}
                    recommendations={recommendations}
                    formData={formData}
                />
            </div>
        </div>
    );
};

export default MiSalud;
