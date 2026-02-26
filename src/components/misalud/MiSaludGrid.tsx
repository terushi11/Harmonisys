import { Incident, Team, Event, colorTypes } from '@/types';
import { Card, CardBody, CardHeader, Chip, Skeleton } from '@heroui/react';
import { IncidentGroup, QuestionnaireSubmission, TeamGroup } from './MiSalud';

interface Props {
    isLoading: boolean;
    selectedView: 'teams' | 'events';
    isArchiveView: boolean;
    filteredTeams:
        | Team[]
        | {
              teamName: string;
              members: QuestionnaireSubmission[];
              totalSubmissions: number;
              lastSubmission: string;
          }[];

    handleTeamClick: (teamName: string) => void;
    filteredEvents:
        | Event[]
        | {
              teamDeployed: string;
              incidents: Incident[];
              totalIncidents: number;
              lastIncident: Date;
              severityBreakdown: {
                  [key: string]: number;
              };
          }[];

    getTeamByEventId: (teamId: string) => Team | undefined;
    handleEventClick: (teamDeployed: string) => void;
}

const MiSaludGrid = ({
    isLoading,
    selectedView,
    isArchiveView,
    filteredTeams,
    handleTeamClick,
    filteredEvents,
    getTeamByEventId,
    handleEventClick,
}: Props) => {
    const formatDate = (timestamp: number | string | Date) => {
        const date =
            timestamp instanceof Date ? timestamp : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'critical':
                return 'danger';
            case 'high':
                return 'warning';
            case 'medium':
                return 'primary';
            case 'low':
                return 'success';
            default:
                return 'default';
        }
    };

    return (
        <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-teal-500 to-cyan-600 rounded-full"></div>
                {selectedView === 'teams'
                    ? 'Team Management'
                    : 'Event Tracking'}
            </h2>

            {!isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {selectedView === 'teams'
                        ? isArchiveView
                            ? // Show original teams data in archive
                              (filteredTeams as Team[]).map((team) => (
                                  <Card
                                      key={team.id}
                                      isPressable
                                      onPress={() => handleTeamClick(team.name)}
                                      className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                  >
                                      <CardHeader className="pb-2">
                                          <div className="flex justify-between items-start w-full">
                                              <div className="flex-1">
                                                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                                                      {team.name}
                                                  </h3>
                                                  <p className="text-sm text-slate-500 font-medium">
                                                      Code: {team.code}
                                                  </p>
                                              </div>
                                              <Chip
                                                  size="sm"
                                                  color="default"
                                                  variant="flat"
                                              >
                                                  📁 Archived
                                              </Chip>
                                          </div>
                                      </CardHeader>
                                      <CardBody className="pt-0">
                                          <div className="space-y-3">
                                              <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                                                  <span className="text-sm font-medium text-slate-600">
                                                      Members:
                                                  </span>
                                                  <span className="font-bold text-slate-800">
                                                      {team.totalMembers === -1
                                                          ? 'Unknown'
                                                          : team.totalMembers}
                                                  </span>
                                              </div>
                                              <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                                                  <span className="text-sm font-medium text-slate-600">
                                                      Leader:
                                                  </span>
                                                  <span className="font-bold text-slate-800">
                                                      {team.leaderId
                                                          ? '✅ Yes'
                                                          : '❌ No'}
                                                  </span>
                                              </div>
                                              <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                                                  <span className="text-sm font-medium text-slate-600">
                                                      Created:
                                                  </span>
                                                  <span className="font-bold text-slate-800">
                                                      {formatDate(
                                                          team.createdAt
                                                      )}
                                                  </span>
                                              </div>
                                          </div>
                                      </CardBody>
                                  </Card>
                              ))
                            : // Show new questionnaire team groups
                              (filteredTeams as TeamGroup[]).map((team) => (
                                  <Card
                                      key={team.teamName}
                                      isPressable
                                      onPress={() =>
                                          handleTeamClick(team.teamName)
                                      }
                                      className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                  >
                                      <CardHeader className="pb-2">
                                          <div className="flex justify-between items-start w-full">
                                              <div className="flex-1">
                                                  <h3 className="text-xl font-bold text-slate-800 mb-1">
                                                      Team {team.teamName}
                                                  </h3>
                                                  <p className="text-sm text-slate-500 font-medium">
                                                      {team.totalSubmissions}{' '}
                                                      submission
                                                      {team.totalSubmissions !==
                                                      1
                                                          ? 's'
                                                          : ''}
                                                  </p>
                                              </div>
                                              <Chip
                                                  size="sm"
                                                  color="success"
                                                  variant="flat"
                                              >
                                                  ✅ Active
                                              </Chip>
                                          </div>
                                      </CardHeader>
                                      <CardBody className="pt-0">
                                          <div className="space-y-3">
                                              <Card className="bg-emerald-50/50">
                                                  <CardBody className="p-3">
                                                      <div className="text-sm font-medium text-slate-600 mb-2">
                                                          Team Members:
                                                      </div>
                                                      <div className="text-sm font-bold text-slate-800 leading-relaxed">
                                                          {team.members
                                                              .length <= 3
                                                              ? team.members
                                                                    .map(
                                                                        (m) =>
                                                                            m.name
                                                                    )
                                                                    .join(', ')
                                                              : `${team.members
                                                                    .slice(0, 3)
                                                                    .map(
                                                                        (m) =>
                                                                            m.name
                                                                    )
                                                                    .join(
                                                                        ', '
                                                                    )} +${team.members.length - 3} more`}
                                                      </div>
                                                  </CardBody>
                                              </Card>
                                              <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                                                  <span className="text-sm font-medium text-slate-600">
                                                      Submissions:
                                                  </span>
                                                  <span className="font-bold text-slate-800">
                                                      {team.totalSubmissions}
                                                  </span>
                                              </div>
                                              <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                                                  <span className="text-sm font-medium text-slate-600">
                                                      Last Activity:
                                                  </span>
                                                  <span className="font-bold text-slate-800">
                                                      {formatDate(
                                                          team.lastSubmission
                                                      )}
                                                  </span>
                                              </div>
                                          </div>
                                      </CardBody>
                                  </Card>
                              ))
                        : isArchiveView
                          ? // Show original events data in archive
                            (filteredEvents as Event[]).map((event) => {
                                const team = getTeamByEventId(event.teamId);
                                return (
                                    <Card
                                        key={event.id}
                                        className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2"
                                    >
                                        <CardHeader className="pb-2">
                                            <div className="flex justify-between items-start w-full">
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold text-slate-800 mb-1">
                                                        {team?.name ||
                                                            'Unknown Team'}
                                                    </h3>
                                                    <p className="text-sm text-slate-500 font-medium">
                                                        Event ID:{' '}
                                                        {event.id.slice(0, 8)}
                                                        ...
                                                    </p>
                                                </div>
                                                <Chip
                                                    size="sm"
                                                    color="default"
                                                    variant="flat"
                                                >
                                                    📁 Archived
                                                </Chip>
                                            </div>
                                        </CardHeader>
                                        <CardBody className="pt-0">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        Team Code:
                                                    </span>
                                                    <span className="font-bold text-slate-800">
                                                        {team?.code || 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        Type:
                                                    </span>
                                                    <span className="font-bold text-slate-800">
                                                        {event.type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                                                    <span className="text-sm font-medium text-slate-600">
                                                        Start Date:
                                                    </span>
                                                    <span className="font-bold text-slate-800">
                                                        {formatDate(
                                                            event.startDate
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </CardBody>
                                    </Card>
                                );
                            })
                          : // Show new incidents data grouped by teamDeployed
                            (filteredEvents as IncidentGroup[]).map((group) => (
                                <Card
                                    key={group.teamDeployed}
                                    isPressable
                                    onPress={() =>
                                        handleEventClick(group.teamDeployed)
                                    }
                                    className="bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl border border-white/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                >
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start w-full">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-slate-800 mb-1">
                                                    Team:{' '}
                                                    {group.teamDeployed ||
                                                        'Unassigned'}
                                                </h3>
                                                <p className="text-sm text-slate-500 font-medium">
                                                    {group.totalIncidents}{' '}
                                                    incident
                                                    {group.totalIncidents !== 1
                                                        ? 's'
                                                        : ''}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(
                                                    group.severityBreakdown
                                                )
                                                    .slice(0, 2)
                                                    .map(
                                                        ([severity, count]) => (
                                                            <Chip
                                                                key={severity}
                                                                size="sm"
                                                                color={
                                                                    getSeverityColor(
                                                                        severity
                                                                    ) as colorTypes
                                                                }
                                                                variant="flat"
                                                                className="text-xs"
                                                            >
                                                                {severity}:{' '}
                                                                {count}
                                                            </Chip>
                                                        )
                                                    )}
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardBody className="pt-0">
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl">
                                                <span className="text-sm font-medium text-slate-600">
                                                    Latest Incident:
                                                </span>
                                                <span className="font-bold text-slate-800">
                                                    {formatDate(
                                                        group.lastIncident
                                                    )}
                                                </span>
                                            </div>
                                            <Card className="bg-red-50/50">
                                                <CardBody className="p-3">
                                                    <div className="text-sm font-medium text-slate-600 mb-1">
                                                        Most Recent:
                                                    </div>
                                                    <div className="text-sm font-bold text-slate-800">
                                                        {group.incidents[0]?.summary.substring(
                                                            0,
                                                            40
                                                        )}
                                                        ...
                                                    </div>
                                                </CardBody>
                                            </Card>

                                            {group.incidents.length > 0 && (
                                                <Card className="bg-blue-50/50">
                                                    <CardBody className="p-3">
                                                        <div className="text-xs font-medium text-slate-600 mb-2">
                                                            Recent Incidents:
                                                        </div>
                                                        <div className="space-y-2">
                                                            {group.incidents
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        incident
                                                                    ) => (
                                                                        <div
                                                                            key={
                                                                                incident.id
                                                                            }
                                                                            className="flex justify-between items-start text-xs"
                                                                        >
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-slate-800 mb-1">
                                                                                    {
                                                                                        incident.summary
                                                                                    }
                                                                                </div>
                                                                                <div className="text-slate-500">
                                                                                    📍{' '}
                                                                                    {
                                                                                        incident.location
                                                                                    }{' '}
                                                                                    •
                                                                                    📅{' '}
                                                                                    {formatDate(
                                                                                        incident.date
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <Chip
                                                                                size="sm"
                                                                                color={
                                                                                    getSeverityColor(
                                                                                        incident.severity
                                                                                    ) as colorTypes
                                                                                }
                                                                                variant="flat"
                                                                                className="ml-2 text-xs"
                                                                            >
                                                                                {
                                                                                    incident.severity
                                                                                }
                                                                            </Chip>
                                                                        </div>
                                                                    )
                                                                )}
                                                        </div>
                                                    </CardBody>
                                                </Card>
                                            )}
                                        </div>
                                    </CardBody>
                                </Card>
                            ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                        <Card
                            key={index}
                            className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20"
                        >
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start w-full">
                                    <div className="flex-1">
                                        <Skeleton className="w-48 h-6 rounded-lg mb-2">
                                            <div className="h-6"></div>
                                        </Skeleton>
                                        <Skeleton className="w-36 h-4 rounded-lg">
                                            <div className="h-4"></div>
                                        </Skeleton>
                                    </div>
                                    <Skeleton className="w-20 h-6 rounded-full">
                                        <div className="h-6"></div>
                                    </Skeleton>
                                </div>
                            </CardHeader>
                            <CardBody className="pt-0">
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex justify-between items-center p-3 bg-slate-50/50 rounded-xl"
                                        >
                                            <Skeleton className="w-28 h-4 rounded">
                                                <div className="h-4"></div>
                                            </Skeleton>
                                            <Skeleton className="w-20 h-4 rounded">
                                                <div className="h-4"></div>
                                            </Skeleton>
                                        </div>
                                    ))}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            )}

            {/* Empty State */}
            {!isLoading &&
                ((selectedView === 'teams' && filteredTeams.length === 0) ||
                    (selectedView === 'events' &&
                        filteredEvents.length === 0)) && (
                    <Card className="bg-white/70 backdrop-blur-sm shadow-lg border border-white/20 max-w-md mx-auto">
                        <CardBody className="p-12 text-center">
                            <div className="text-6xl mb-6">🔍</div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">
                                No Data Found
                            </h3>
                            <p className="text-slate-600 leading-relaxed">
                                {isArchiveView
                                    ? 'No archived data matches your current search criteria. Try adjusting your filters or search terms.'
                                    : 'No current data available for your selection. Consider creating new entries or adjusting your filters.'}
                            </p>
                        </CardBody>
                    </Card>
                )}
        </div>
    );
};

export default MiSaludGrid;
